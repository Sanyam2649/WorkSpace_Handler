const express = require("express");
const authMiddleware = require("../middleware/userAuth");
const Workspace = require("../models/workspace");
const Document = require("../models/document");
const ChatRoom = require("../models/chatModel");
const User = require("../models/user");
const logger = require("../config/logger");

const router = express.Router();
router.use(authMiddleware);

const getDateRange = (timeRange) => {
  const now = new Date();
  let startDate, days, groupBy;
  
  switch (timeRange) {
    case 'daily':
      startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); 
      days = 7;
      groupBy = 'day';
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 6 * 7 * 24 * 60 * 60 * 1000); 
      days = 7;
      groupBy = 'week';
      break;
    case 'monthly':
      startDate = new Date(now.getTime() - 11 * 30 * 24 * 60 * 60 * 1000); 
      days = 12;
      groupBy = 'month';
      break;
    case 'yearly':
      startDate = new Date(now.getTime() - 4 * 365 * 24 * 60 * 60 * 1000); 
      days = 5;
      groupBy = 'year';
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      days = 30;
      groupBy = 'day';
  }
  
  return { startDate, days, groupBy };
};

const formatDate = (date, groupBy) => {
  switch (groupBy) {
    case 'day':
      return date.toISOString().split('T')[0]; 
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); 
      return `Week of ${weekStart.toISOString().split('T')[0]}`;
    case 'month':
      return date.toISOString().substring(0, 7); 
    case 'year':
      return date.getFullYear().toString();
    default:
      return date.toISOString().split('T')[0];
  }
};

// Get analytics overview
router.get("/overview", async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = 'monthly' } = req.query;
    
    logger.info(`Fetching analytics overview for user ${userId}, timeRange: ${timeRange}`);
    
    const { startDate } = getDateRange(timeRange);

    // Get user's workspaces
    const workspaces = await Workspace.find({
      $or: [{ createdBy: userId }, { "members.user": userId }]
    });

    const workspaceIds = workspaces.map(ws => ws._id);

    // Get documents in user's workspaces
    const documents = await Document.find({
      workspace: { $in: workspaceIds }
    });

    // Get chat messages in user's workspaces
    const chatMessages = await ChatRoom.find({
      $or: [
        { workspace: { $in: workspaceIds } },
        { from: userId },
        { to: userId }
      ],
      createdAt: { $gte: startDate }
    });

    // Calculate stats
    const totalWorkspaces = workspaces.length;
    const activeWorkspaces = workspaces.filter(ws => 
      new Date(ws.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const totalDocuments = documents.length;
    const documentsCreated = documents.filter(doc => 
      new Date(doc.createdAt) >= startDate
    ).length;
    const documentsUpdated = documents.filter(doc => 
      new Date(doc.updatedAt) >= startDate
    ).length;

    const totalMessages = chatMessages.length;
    const uniqueChats = [...new Set(chatMessages.map(msg => 
      msg.workspace ? msg.workspace.toString() : 
      msg.document ? msg.document.toString() : 
      msg.to ? msg.to.toString() : msg.from.toString()
    ))].length;

    // Calculate growth percentages
    const previousPeriodStart = new Date(startDate.getTime() - (startDate.getTime() - new Date().getTime()));
    const previousWorkspaces = await Workspace.countDocuments({
      $or: [{ createdBy: userId }, { "members.user": userId }],
      createdAt: { $lt: startDate }
    });
    
    const workspaceGrowth = previousWorkspaces > 0 ? 
      Math.round(((totalWorkspaces - previousWorkspaces) / previousWorkspaces) * 100) : 100;

    logger.info(`Analytics overview fetched successfully for user ${userId}`);
    
    res.json({
      workspaceStats: {
        total: totalWorkspaces,
        active: activeWorkspaces,
        growth: workspaceGrowth
      },
      documentStats: {
        total: totalDocuments,
        created: documentsCreated,
        updated: documentsUpdated,
        growth: Math.round((documentsCreated / Math.max(1, totalDocuments - documentsCreated)) * 100)
      },
      chatStats: {
        totalMessages,
        activeChats: uniqueChats,
        avgMessagesPerDay: Math.round(totalMessages / Math.max(1, (Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000)))
      },
      timeRange
    });
  } catch (err) {
    logger.error("Analytics overview error:", { error: err.message, userId: req.user?.id, stack: err.stack });
    res.status(500).json({ message: "Failed to fetch analytics overview" });
  }
});

// Get activity data over time
router.get("/activity", async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = 'monthly', type = 'all' } = req.query;
    
    logger.info(`Fetching activity data for user ${userId}, timeRange: ${timeRange}, type: ${type}`);
    
    const { startDate, days, groupBy } = getDateRange(timeRange);
    const activityData = [];

    // Get user's workspace IDs
    const userWorkspaces = await Workspace.find({
      $or: [{ createdBy: userId }, { "members.user": userId }]
    }).select('_id');
    
    const workspaceIds = userWorkspaces.map(ws => ws._id);

    for (let i = 0; i < days; i++) {
      let periodStart, periodEnd;
      
      switch (groupBy) {
        case 'day':
          periodStart = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
          periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'week':
          periodStart = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
          periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          periodStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
          periodEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 1);
          break;
        case 'year':
          periodStart = new Date(startDate.getFullYear() + i, 0, 1);
          periodEnd = new Date(startDate.getFullYear() + i + 1, 0, 1);
          break;
      }

      let periodData = {
        date: formatDate(periodStart, groupBy),
        workspaces: 0,
        documents: 0,
        messages: 0,
        total: 0
      };

      // Count workspace activities
      if (type === 'all' || type === 'workspaces') {
        const workspaceActivity = await Workspace.countDocuments({
          _id: { $in: workspaceIds },
          $or: [
            { createdAt: { $gte: periodStart, $lt: periodEnd } },
            { updatedAt: { $gte: periodStart, $lt: periodEnd } }
          ]
        });
        periodData.workspaces = workspaceActivity;
      }

      // Count document activities
      if (type === 'all' || type === 'documents') {
        const documentActivity = await Document.countDocuments({
          workspace: { $in: workspaceIds },
          $or: [
            { createdAt: { $gte: periodStart, $lt: periodEnd } },
            { updatedAt: { $gte: periodStart, $lt: periodEnd } }
          ]
        });
        periodData.documents = documentActivity;
      }

      // Count chat activities
      if (type === 'all' || type === 'messages') {
        const messageActivity = await ChatRoom.countDocuments({
          $or: [
            { workspace: { $in: workspaceIds } },
            { from: userId },
            { to: userId }
          ],
          createdAt: { $gte: periodStart, $lt: periodEnd }
        });
        periodData.messages = messageActivity;
      }

      periodData.total = periodData.workspaces + periodData.documents + periodData.messages;
      activityData.push(periodData);
    }

    logger.info(`Activity data fetched successfully for user ${userId}`);
    
    res.json({
      data: activityData,
      timeRange,
      groupBy
    });
  } catch (err) {
    logger.error("Analytics activity error:", { error: err.message, userId: req.user?.id, stack: err.stack });
    res.status(500).json({ message: "Failed to fetch activity data" });
  }
});

// Get user activity by hour
router.get("/user-activity", async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = 'daily' } = req.query;
    
    logger.info(`Fetching user activity by hour for user ${userId}, timeRange: ${timeRange}`);
    
    const { startDate } = getDateRange(timeRange);
    const hourlyActivity = [];

    // Get user's workspace IDs
    const userWorkspaces = await Workspace.find({
      $or: [{ createdBy: userId }, { "members.user": userId }]
    }).select('_id');
    
    const workspaceIds = userWorkspaces.map(ws => ws._id);

    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(startDate);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      // Count document activities for the entire date range but grouped by hour
      const documentActivity = await Document.countDocuments({
        workspace: { $in: workspaceIds },
        $or: [
          { createdAt: { $gte: startDate, $lt: new Date() } },
          { updatedAt: { $gte: startDate, $lt: new Date() } }
        ],
        $expr: {
          $eq: [{ $hour: "$createdAt" }, hour]
        }
      });

      // Count chat activities for the entire date range but grouped by hour
      const chatActivity = await ChatRoom.countDocuments({
        $or: [
          { workspace: { $in: workspaceIds } },
          { from: userId },
          { to: userId }
        ],
        createdAt: { $gte: startDate, $lt: new Date() },
        $expr: {
          $eq: [{ $hour: "$createdAt" }, hour]
        }
      });

      hourlyActivity.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        documents: documentActivity,
        messages: chatActivity,
        total: documentActivity + chatActivity
      });
    }

    logger.info(`User activity by hour fetched successfully for user ${userId}`);
    
    res.json({
      data: hourlyActivity,
      timeRange,
      dateRange: {
        start: startDate.toISOString(),
        end: new Date().toISOString()
      }
    });
  } catch (err) {
    logger.error("User activity error:", { error: err.message, userId: req.user?.id, stack: err.stack });
    res.status(500).json({ message: "Failed to fetch user activity" });
  }
});

// Get top workspaces by activity
router.get("/top-workspaces", async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, timeRange = 'monthly' } = req.query;

    logger.info(`Fetching top workspaces for user ${userId}, limit: ${limit}, timeRange: ${timeRange}`);
    
    const { startDate } = getDateRange(timeRange);

    const workspaces = await Workspace.find({
      $or: [{ createdBy: userId }, { "members.user": userId }]
    })
    .populate('members.user', 'firstName lastName username email')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit));

    const workspaceStats = await Promise.all(
      workspaces.map(async (workspace) => {
        const documentCount = await Document.countDocuments({
          workspace: workspace._id,
          $or: [
            { createdAt: { $gte: startDate } },
            { updatedAt: { $gte: startDate } }
          ]
        });
        
        const messageCount = await ChatRoom.countDocuments({
          workspace: workspace._id,
          createdAt: { $gte: startDate }
        });

        const memberCount = workspace.members.length;

        return {
          id: workspace._id,
          name: workspace.name,
          description: workspace.description,
          memberCount,
          documentCount,
          messageCount,
          activityCount: documentCount + messageCount,
          lastActivity: workspace.updatedAt
        };
      })
    );

    // Sort by activity count
    workspaceStats.sort((a, b) => b.activityCount - a.activityCount);

    logger.info(`Top workspaces fetched successfully for user ${userId}`);
    
    res.json({
      data: workspaceStats,
      timeRange
    });
  } catch (err) {
    logger.error("Top workspaces error:", { error: err.message, userId: req.user?.id, stack: err.stack });
    res.status(500).json({ message: "Failed to fetch top workspaces" });
  }
});

// Get recent document activity
router.get("/recent-documents", async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, timeRange = 'monthly' } = req.query;

    logger.info(`Fetching recent documents for user ${userId}, limit: ${limit}, timeRange: ${timeRange}`);
    
    const { startDate } = getDateRange(timeRange);

    const userWorkspaces = await Workspace.find({
      $or: [{ createdBy: userId }, { "members.user": userId }]
    }).select('_id');

    const workspaceIds = userWorkspaces.map(ws => ws._id);

    const documents = await Document.find({
      workspace: { $in: workspaceIds },
      $or: [
        { createdAt: { $gte: startDate } },
        { updatedAt: { $gte: startDate } }
      ]
    })
    .populate('workspace', 'name')
    .populate('createdBy', 'firstName lastName username')
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit));

    const formattedDocuments = documents.map(doc => ({
      id: doc._id,
      title: doc.title,
      workspaceName: doc.workspace?.name || 'Unknown Workspace',
      createdBy: doc.createdBy ? 
        `${doc.createdBy.firstName} ${doc.createdBy.lastName}` : 
        'Unknown User',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      lastModified: doc.updatedAt
    }));

    logger.info(`Recent documents fetched successfully for user ${userId}`);
    
    res.json({
      data: formattedDocuments,
      timeRange
    });
  } catch (err) {
    logger.error("Recent documents error:", { error: err.message, userId: req.user?.id, stack: err.stack });
    res.status(500).json({ message: "Failed to fetch recent documents" });
  }
});

// Export analytics data
router.get("/export", async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json', timeRange = 'monthly' } = req.query;

    logger.info(`Exporting analytics data for user ${userId}, format: ${format}, timeRange: ${timeRange}`);
    
    // Get all analytics data in parallel
    const [overview, activity, userActivity, topWorkspaces, recentDocuments] = await Promise.all([
      Workspace.find({
        $or: [{ createdBy: userId }, { "members.user": userId }]
      }).then(workspaces => {
        const workspaceIds = workspaces.map(ws => ws._id);
        return Promise.all([
          workspaces.length,
          Document.countDocuments({ workspace: { $in: workspaceIds } }),
          ChatRoom.countDocuments({ 
            $or: [
              { workspace: { $in: workspaceIds } },
              { from: userId },
              { to: userId }
            ]
          })
        ]).then(([wsCount, docCount, msgCount]) => ({
          workspaceCount: wsCount,
          documentCount: docCount,
          messageCount: msgCount
        }));
      }),
      // For simplicity in export, we'll use a simplified version
      Promise.resolve({ message: "Export activity data" }),
      Promise.resolve({ message: "Export user activity data" }),
      Promise.resolve({ message: "Export top workspaces data" }),
      Promise.resolve({ message: "Export recent documents data" })
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      timeRange,
      user: {
        id: userId,
        // Add user info if needed
      },
      overview,
      activity,
      userActivity,
      topWorkspaces,
      recentDocuments
    };

    if (format === 'csv') {
      // Simple CSV conversion for overview
      let csv = 'Metric,Count\n';
      csv += `Workspaces,${overview.workspaceCount}\n`;
      csv += `Documents,${overview.documentCount}\n`;
      csv += `Messages,${overview.messageCount}\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv"`);
      
      logger.info(`Analytics data exported as CSV for user ${userId}`);
      res.send(csv);
    } else {
      logger.info(`Analytics data exported as JSON for user ${userId}`);
      res.json(exportData);
    }
  } catch (err) {
    logger.error("Export analytics error:", { error: err.message, userId: req.user?.id, stack: err.stack });
    res.status(500).json({ message: "Failed to export analytics data" });
  }
});

// ==================== ADDITIONAL ANALYTICS ROUTES ====================

// Get workspace-specific analytics
router.get("/workspace/:workspaceId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const { timeRange = 'monthly' } = req.query;

    logger.info(`Fetching workspace analytics for user ${userId}, workspace: ${workspaceId}, timeRange: ${timeRange}`);
    
    // Verify user has access to this workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [{ createdBy: userId }, { "members.user": userId }]
    });

    if (!workspace) {
      logger.warn(`Workspace access denied or not found for user ${userId}, workspace: ${workspaceId}`);
      return res.status(404).json({ message: "Workspace not found or access denied" });
    }

    const { startDate } = getDateRange(timeRange);

    // Get workspace documents
    const documents = await Document.find({
      workspace: workspaceId,
      $or: [
        { createdAt: { $gte: startDate } },
        { updatedAt: { $gte: startDate } }
      ]
    });

    // Get workspace messages
    const messages = await ChatRoom.find({
      workspace: workspaceId,
      createdAt: { $gte: startDate }
    });

    // Get member activity
    const memberActivity = await Promise.all(
      workspace.members.map(async (member) => {
        const userDocs = await Document.countDocuments({
          workspace: workspaceId,
          createdBy: member.user,
          $or: [
            { createdAt: { $gte: startDate } },
            { updatedAt: { $gte: startDate } }
          ]
        });

        const userMessages = await ChatRoom.countDocuments({
          workspace: workspaceId,
          from: member.user,
          createdAt: { $gte: startDate }
        });

        const user = await User.findById(member.user).select('firstName lastName username email');

        return {
          user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            username: user.username,
            email: user.email
          },
          role: member.roles[0],
          documents: userDocs,
          messages: userMessages,
          totalActivity: userDocs + userMessages
        };
      })
    );

    logger.info(`Workspace analytics fetched successfully for user ${userId}, workspace: ${workspaceId}`);
    
    res.json({
      workspace: {
        id: workspace._id,
        name: workspace.name,
        description: workspace.description
      },
      timeRange,
      stats: {
        documents: {
          total: documents.length,
          created: documents.filter(doc => new Date(doc.createdAt) >= startDate).length,
          updated: documents.filter(doc => new Date(doc.updatedAt) >= startDate).length
        },
        messages: {
          total: messages.length,
          byHour: Array.from({ length: 24 }, (_, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            count: messages.filter(msg => new Date(msg.createdAt).getHours() === hour).length
          }))
        },
        members: {
          total: workspace.members.length,
          active: memberActivity.filter(member => member.totalActivity > 0).length
        }
      },
      memberActivity: memberActivity.sort((a, b) => b.totalActivity - a.totalActivity),
      recentActivity: [
        ...documents.map(doc => ({
          type: 'document',
          action: new Date(doc.createdAt) >= startDate ? 'created' : 'updated',
          title: doc.title,
          user: doc.createdBy,
          timestamp: new Date(doc.createdAt) >= startDate ? doc.createdAt : doc.updatedAt
        })),
        ...messages.map(msg => ({
          type: 'message',
          action: 'sent',
          content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
          user: msg.from,
          timestamp: msg.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20)
    });
  } catch (err) {
    logger.error("Workspace analytics error:", { error: err.message, userId: req.user?.id, workspaceId: req.params.workspaceId, stack: err.stack });
    res.status(500).json({ message: "Failed to fetch workspace analytics" });
  }
});

// Get user engagement metrics
router.get("/user-engagement", async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = 'monthly' } = req.query;

    logger.info(`Fetching user engagement metrics for user ${userId}, timeRange: ${timeRange}`);
    
    const { startDate } = getDateRange(timeRange);

    // Get user's workspaces
    const workspaces = await Workspace.find({
      $or: [{ createdBy: userId }, { "members.user": userId }]
    });

    const workspaceIds = workspaces.map(ws => ws._id);

    // Calculate engagement metrics
    const documentActivities = await Document.countDocuments({
      workspace: { $in: workspaceIds },
      $or: [
        { createdBy: userId, createdAt: { $gte: startDate } },
        { updatedBy: userId, updatedAt: { $gte: startDate } }
      ]
    });

    const messageActivities = await ChatRoom.countDocuments({
      $or: [
        { from: userId, createdAt: { $gte: startDate } },
        { to: userId, createdAt: { $gte: startDate } }
      ]
    });

    const activeDays = await Document.aggregate([
      {
        $match: {
          workspace: { $in: workspaceIds },
          $or: [
            { createdBy: userId, createdAt: { $gte: startDate } },
            { updatedBy: userId, updatedAt: { $gte: startDate } }
          ]
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          }
        }
      },
      {
        $count: "uniqueDays"
      }
    ]);

    const engagementScore = Math.min(100, 
      (documentActivities * 2) + 
      (messageActivities * 1) + 
      ((activeDays[0]?.uniqueDays || 0) * 3)
    );

    logger.info(`User engagement metrics fetched successfully for user ${userId}`);
    
    res.json({
      timeRange,
      metrics: {
        documentActivities,
        messageActivities,
        activeDays: activeDays[0]?.uniqueDays || 0,
        engagementScore,
        engagementLevel: engagementScore >= 80 ? 'High' : engagementScore >= 50 ? 'Medium' : 'Low'
      },
      dailyBreakdown: await getDailyEngagementBreakdown(userId, workspaceIds, startDate)
    });
  } catch (err) {
    logger.error("User engagement error:", { error: err.message, userId: req.user?.id, stack: err.stack });
    res.status(500).json({ message: "Failed to fetch user engagement metrics" });
  }
});

// Helper function for daily engagement breakdown
async function getDailyEngagementBreakdown(userId, workspaceIds, startDate) {
  const dailyData = [];
  const now = new Date();
  const days = Math.ceil((now - startDate) / (24 * 60 * 60 * 1000));

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

    const [documents, messages] = await Promise.all([
      Document.countDocuments({
        workspace: { $in: workspaceIds },
        $or: [
          { createdBy: userId, createdAt: { $gte: currentDate, $lt: nextDate } },
          { updatedBy: userId, updatedAt: { $gte: currentDate, $lt: nextDate } }
        ]
      }),
      ChatRoom.countDocuments({
        $or: [
          { from: userId, createdAt: { $gte: currentDate, $lt: nextDate } },
          { to: userId, createdAt: { $gte: currentDate, $lt: nextDate } }
        ]
      })
    ]);

    dailyData.push({
      date: currentDate.toISOString().split('T')[0],
      documents,
      messages,
      total: documents + messages
    });
  }

  return dailyData;
}

module.exports = router;