import api from "./axios";

/**
 * Fetch contact messages with server-side filters & pagination
 */
export const fetchContactMessages = ({
  page = 1,
  limit = 10,
  isRead,
  isReplied,
  email,
  subject,
  fromDate,
  toDate,
} = {}) => {
  const params = {
    page,
    limit,
  };

  if (isRead !== undefined && isRead !== "")
    params.isRead = isRead;

  if (isReplied !== undefined && isReplied !== "")
    params.isReplied = isReplied;

  if (email) params.email = email;
  if (subject) params.subject = subject;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  return api.get("/admin/contactMessages", { params });
};

/**
 * Mark a message as read
 */
export const markMessageRead = (id) => {
  return api.patch(`/admin/contactMessages/${id}/read`);
};

/**
 * (Optional / compatibility)
 * Mark message as replied — not required in your current workflow
 */
export const markMessageReplied = (id) => {
  return api.patch(`/admin/contactMessages/${id}/replied`);
};

/**
 * Hard delete a contact message (after reply)
 */
export const deleteContactMessage = (id) => {
  return api.delete(`/admin/contactMessages/${id}`);
};
