const Workspace = require("../models/workspace");
const Document = require("../models/document");
const User = require("../models/user");

async function onlyAdminChatInWorkspace(userId, workspaceId) {
  const ws = await Workspace.findById(workspaceId);
  if (!ws) return false;
  const member = ws.members.find((m) => m.user.toString() === userId.toString());
  return member ? member.roles.includes("Admin") : false;
}

async function onlyAdminorEditorChatInWorkspace(userId, workspaceId) {
  const ws = await Workspace.findById(workspaceId);
  if (!ws) return false;
  const member = ws.members.find((m) => m.user.toString() === userId.toString());
  return member ? (member.roles.includes("Admin") || member.roles.includes("Editor")) : false;
}

async function onlyAdminChatInDocs(userId, docId) {
  const doc = await Document.findById(docId);
  if (!doc) return false;
  const perm = doc.permissions.find((p) => p.user.toString() === userId.toString());
  return perm ? perm.role === "Admin" : false;
}

async function onlyAdminorEditorChatInInDocument(userId, docId) {
  const doc = await Document.findById(docId);
  if (!doc) return false;
  const perm = doc.permissions.find((p) => p.user.toString() === userId.toString());
  return perm ? (perm.role === "Admin" || perm.role === "Editor") : false;
}

async function isBlocked(fromId, toId) {
  const user = await User.findById(toId);
  return user?.blockedUsers?.includes(fromId) || false;
}

module.exports = {
  onlyAdminChatInWorkspace,
  onlyAdminorEditorChatInWorkspace,
  onlyAdminChatInDocs,
  onlyAdminorEditorChatInInDocument,
  isBlocked,
};
