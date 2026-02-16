import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CButton,
  CBadge,
  CSpinner,
  CAlert,
  CListGroup,
  CListGroupItem,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBell, cilEnvelopeOpen, cilTask, cilCommentSquare, cilCheckAlt, cilTrash } from '@coreui/icons';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const NotificationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'updates';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    updates: [],
    messages: [],
    tasks: [],
    comments: [],
  });
  const [counts, setCounts] = useState({
    updates: 0,
    messages: 0,
    tasks: 0,
    comments: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Try to fetch from API
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || notifications);
      setCounts(response.data.counts || counts);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use mock data if API not available
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockData = {
      updates: [
        { id: 1, title: 'System Update', message: 'New features have been added to the dashboard', date: '2 hours ago', read: false },
        { id: 2, title: 'Maintenance Notice', message: 'Scheduled maintenance on Sunday 2AM-4AM', date: '1 day ago', read: true },
        { id: 3, title: 'New Feature', message: 'Check out the enhanced UI components', date: '2 days ago', read: true },
      ],
      messages: [
        { id: 1, from: 'Dr. Smith', message: 'Your appointment has been confirmed', date: '30 min ago', read: false },
        { id: 2, from: 'Admin', message: 'Welcome to the Hospital Management System', date: '1 day ago', read: false },
        { id: 3, from: 'Support', message: 'Your ticket #1234 has been resolved', date: '3 days ago', read: true },
      ],
      tasks: [
        { id: 1, title: 'Complete profile information', priority: 'high', date: '2 hours ago', completed: false },
        { id: 2, title: 'Review appointment schedule', priority: 'medium', date: '1 day ago', completed: false },
        { id: 3, title: 'Update medical records', priority: 'low', date: '2 days ago', completed: true },
      ],
      comments: [
        { id: 1, author: 'Dr. Johnson', comment: 'Please review the lab results', on: 'Medical Record #123', date: '1 hour ago', read: false },
        { id: 2, author: 'Nurse Mary', comment: 'Patient is ready for discharge', on: 'Bed Assignment #45', date: '3 hours ago', read: false },
        { id: 3, author: 'Admin', comment: 'Invoice has been processed', on: 'Invoice #789', date: '1 day ago', read: true },
      ],
    };

    setNotifications(mockData);
    setCounts({
      updates: mockData.updates.filter(n => !n.read).length,
      messages: mockData.messages.filter(n => !n.read).length,
      tasks: mockData.tasks.filter(n => !n.completed).length,
      comments: mockData.comments.filter(n => !n.read).length,
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const markAsRead = async (type, id) => {
    try {
      await api.post(`/notifications/${type}/${id}/read`);
      // Update local state
      const updated = { ...notifications };
      updated[type] = updated[type].map(item =>
        item.id === id ? { ...item, read: true } : item
      );
      setNotifications(updated);
      fetchNotifications();
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to update');
    }
  };

  const deleteNotification = async (type, id) => {
    try {
      await api.delete(`/notifications/${type}/${id}`);
      const updated = { ...notifications };
      updated[type] = updated[type].filter(item => item.id !== id);
      setNotifications(updated);
      toast.success('Deleted successfully');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  const markTaskComplete = async (id) => {
    try {
      await api.post(`/notifications/tasks/${id}/complete`);
      const updated = { ...notifications };
      updated.tasks = updated.tasks.map(task =>
        task.id === id ? { ...task, completed: true } : task
      );
      setNotifications(updated);
      toast.success('Task completed!');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = { high: 'danger', medium: 'warning', low: 'info' };
    return colors[priority] || 'secondary';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-2">Loading notifications...</p>
      </div>
    );
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong className="fs-5">
              <CIcon icon={cilBell} className="me-2" />
              Notifications
            </strong>
          </CCardHeader>
          <CCardBody>
            {/* Tabs */}
            <CNav variant="tabs" role="tablist" className="mb-4">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'updates'}
                  onClick={() => handleTabChange('updates')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilBell} className="me-2" />
                  Updates
                  {counts.updates > 0 && (
                    <CBadge color="info" className="ms-2">{counts.updates}</CBadge>
                  )}
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'messages'}
                  onClick={() => handleTabChange('messages')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilEnvelopeOpen} className="me-2" />
                  Messages
                  {counts.messages > 0 && (
                    <CBadge color="success" className="ms-2">{counts.messages}</CBadge>
                  )}
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'tasks'}
                  onClick={() => handleTabChange('tasks')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilTask} className="me-2" />
                  Tasks
                  {counts.tasks > 0 && (
                    <CBadge color="danger" className="ms-2">{counts.tasks}</CBadge>
                  )}
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'comments'}
                  onClick={() => handleTabChange('comments')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilCommentSquare} className="me-2" />
                  Comments
                  {counts.comments > 0 && (
                    <CBadge color="warning" className="ms-2">{counts.comments}</CBadge>
                  )}
                </CNavLink>
              </CNavItem>
            </CNav>

            {/* Tab Content */}
            <CTabContent>
              {/* Updates */}
              <CTabPane visible={activeTab === 'updates'}>
                {notifications.updates.length === 0 ? (
                  <CAlert color="info">No updates available</CAlert>
                ) : (
                  <CListGroup>
                    {notifications.updates.map((update) => (
                      <CListGroupItem
                        key={update.id}
                        className={`d-flex justify-content-between align-items-start ${!update.read ? 'bg-light' : ''}`}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <h6 className="mb-1">{update.title}</h6>
                            <small className="text-medium-emphasis">{update.date}</small>
                          </div>
                          <p className="mb-1">{update.message}</p>
                        </div>
                        <div className="ms-3">
                          {!update.read && (
                            <CButton
                              color="info"
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead('updates', update.id)}
                              className="me-2"
                            >
                              <CIcon icon={cilCheckAlt} />
                            </CButton>
                          )}
                          <CButton
                            color="danger"
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification('updates', update.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CTabPane>

              {/* Messages */}
              <CTabPane visible={activeTab === 'messages'}>
                {notifications.messages.length === 0 ? (
                  <CAlert color="info">No messages available</CAlert>
                ) : (
                  <CListGroup>
                    {notifications.messages.map((message) => (
                      <CListGroupItem
                        key={message.id}
                        className={`d-flex justify-content-between align-items-start ${!message.read ? 'bg-light' : ''}`}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <h6 className="mb-1">From: {message.from}</h6>
                            <small className="text-medium-emphasis">{message.date}</small>
                          </div>
                          <p className="mb-1">{message.message}</p>
                        </div>
                        <div className="ms-3">
                          {!message.read && (
                            <CButton
                              color="success"
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead('messages', message.id)}
                              className="me-2"
                            >
                              <CIcon icon={cilCheckAlt} />
                            </CButton>
                          )}
                          <CButton
                            color="danger"
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification('messages', message.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CTabPane>

              {/* Tasks */}
              <CTabPane visible={activeTab === 'tasks'}>
                {notifications.tasks.length === 0 ? (
                  <CAlert color="info">No tasks available</CAlert>
                ) : (
                  <CListGroup>
                    {notifications.tasks.map((task) => (
                      <CListGroupItem
                        key={task.id}
                        className={`d-flex justify-content-between align-items-start ${task.completed ? 'text-decoration-line-through text-muted' : ''}`}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-1">
                              {task.title}
                              <CBadge color={getPriorityColor(task.priority)} className="ms-2">
                                {task.priority}
                              </CBadge>
                            </h6>
                            <small className="text-medium-emphasis">{task.date}</small>
                          </div>
                        </div>
                        <div className="ms-3">
                          {!task.completed && (
                            <CButton
                              color="success"
                              size="sm"
                              variant="ghost"
                              onClick={() => markTaskComplete(task.id)}
                              className="me-2"
                            >
                              <CIcon icon={cilCheckAlt} />
                            </CButton>
                          )}
                          <CButton
                            color="danger"
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification('tasks', task.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CTabPane>

              {/* Comments */}
              <CTabPane visible={activeTab === 'comments'}>
                {notifications.comments.length === 0 ? (
                  <CAlert color="info">No comments available</CAlert>
                ) : (
                  <CListGroup>
                    {notifications.comments.map((comment) => (
                      <CListGroupItem
                        key={comment.id}
                        className={`d-flex justify-content-between align-items-start ${!comment.read ? 'bg-light' : ''}`}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <h6 className="mb-1">{comment.author}</h6>
                            <small className="text-medium-emphasis">{comment.date}</small>
                          </div>
                          <p className="mb-1">{comment.comment}</p>
                          <small className="text-medium-emphasis">On: {comment.on}</small>
                        </div>
                        <div className="ms-3">
                          {!comment.read && (
                            <CButton
                              color="warning"
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead('comments', comment.id)}
                              className="me-2"
                            >
                              <CIcon icon={cilCheckAlt} />
                            </CButton>
                          )}
                          <CButton
                            color="danger"
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification('comments', comment.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default NotificationsPage;