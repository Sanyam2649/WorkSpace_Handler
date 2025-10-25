const Workspace = require("../models/workspace");
const Document = require("../models/document");
const User = require("../models/user");
const logger = require("./logger"); // Add this line

async function onlyAdminChatInWorkspace(userId, workspaceId) {
  try {
    const ws = await Workspace.findById(workspaceId);
    if (!ws) {
      logger.warn("Workspace not found for admin chat check", { userId, workspaceId });
      return false;
    }
    
    const member = ws.members.find((m) => m.user.toString() === userId.toString());
    const isAdmin = member ? member.roles.includes("Admin") : false;
    
    if (!isAdmin) {
      logger.warn("User is not admin in workspace", { userId, workspaceId, userRoles: member?.roles });
    } else {
      logger.debug("User confirmed as admin in workspace", { userId, workspaceId });
    }
    
    return isAdmin;
  } catch (error) {
    logger.error("Error in onlyAdminChatInWorkspace", { 
      error: error.message, 
      stack: error.stack, 
      userId, 
      workspaceId 
    });
    return false;
  }
}

async function onlyAdminorEditorChatInWorkspace(userId, workspaceId) {
  try {
    const ws = await Workspace.findById(workspaceId);
    if (!ws) {
      logger.warn("Workspace not found for admin/editor chat check", { userId, workspaceId });
      return false;
    }
    
    const member = ws.members.find((m) => m.user.toString() === userId.toString());
    const hasPermission = member ? (member.roles.includes("Admin") || member.roles.includes("Editor")) : false;
    
    if (!hasPermission) {
      logger.warn("User lacks admin/editor role in workspace", { userId, workspaceId, userRoles: member?.roles });
    } else {
      logger.debug("User confirmed as admin/editor in workspace", { userId, workspaceId, roles: member.roles });
    }
    
    return hasPermission;
  } catch (error) {
    logger.error("Error in onlyAdminorEditorChatInWorkspace", { 
      error: error.message, 
      stack: error.stack, 
      userId, 
      workspaceId 
    });
    return false;
  }
}

async function onlyAdminChatInDocs(userId, docId) {
  try {
    const doc = await Document.findById(docId);
    if (!doc) {
      logger.warn("Document not found for admin chat check", { userId, docId });
      return false;
    }
    
    const perm = doc.permissions.find((p) => p.user.toString() === userId.toString());
    const isAdmin = perm ? perm.role === "Admin" : false;
    
    if (!isAdmin) {
      logger.warn("User is not admin in document", { userId, docId, userRole: perm?.role });
    } else {
      logger.debug("User confirmed as admin in document", { userId, docId });
    }
    
    return isAdmin;
  } catch (error) {
    logger.error("Error in onlyAdminChatInDocs", { 
      error: error.message, 
      stack: error.stack, 
      userId, 
      docId 
    });
    return false;
  }
}

async function onlyAdminorEditorChatInInDocument(userId, docId) {
  try {
    const doc = await Document.findById(docId);
    if (!doc) {
      logger.warn("Document not found for admin/editor chat check", { userId, docId });
      return false;
    }
    
    const perm = doc.permissions.find((p) => p.user.toString() === userId.toString());
    const hasPermission = perm ? (perm.role === "Admin" || perm.role === "Editor") : false;
    
    if (!hasPermission) {
      logger.warn("User lacks admin/editor role in document", { userId, docId, userRole: perm?.role });
    } else {
      logger.debug("User confirmed as admin/editor in document", { userId, docId, role: perm.role });
    }
    
    return hasPermission;
  } catch (error) {
    logger.error("Error in onlyAdminorEditorChatInInDocument", { 
      error: error.message, 
      stack: error.stack, 
      userId, 
      docId 
    });
    return false;
  }
}

async function isBlocked(fromId, toId) {
  try {
    const user = await User.findById(toId);
    const isBlocked = user?.blockedUsers?.includes(fromId) || false;
    
    if (isBlocked) {
      logger.warn("User is blocked from messaging", { fromId, toId });
    } else {
      logger.debug("User is not blocked", { fromId, toId });
    }
    
    return isBlocked;
  } catch (error) {
    logger.error("Error in isBlocked check", { 
      error: error.message, 
      stack: error.stack, 
      fromId, 
      toId 
    });
    return false; 
  }
}

module.exports = {
  onlyAdminChatInWorkspace,
  onlyAdminorEditorChatInWorkspace,
  onlyAdminChatInDocs,
  onlyAdminorEditorChatInInDocument,
  isBlocked,
};