import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { Button } from './button';

// Types pour les notifications
export interface NotificationData {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationData, 'id'>) => void;
  showSuccess: (title: string, message: string, options?: Partial<NotificationData>) => void;
  showWarning: (title: string, message: string, options?: Partial<NotificationData>) => void;
  showError: (title: string, message: string, options?: Partial<NotificationData>) => void;
  showInfo: (title: string, message: string, options?: Partial<NotificationData>) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Composant de notification personnalisé
const NotificationComponent: React.FC<{
  notification: NotificationData;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBackgroundColor()} shadow-lg max-w-md`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {notification.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {notification.message}
          </p>
          {notification.action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={notification.action.onClick}
                className="text-xs"
              >
                {notification.action.label}
              </Button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClose(notification.id)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Provider pour le système de notifications
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: NotificationData = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove après la durée spécifiée
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, newNotification.duration);
    }

    // Intégration avec Sonner pour les notifications toast
    switch (notification.type) {
      case 'success':
        toast.success(notification.title, {
          description: notification.message,
          duration: newNotification.duration,
          action: notification.action ? {
            label: notification.action.label,
            onClick: notification.action.onClick,
          } : undefined,
        });
        break;
      case 'warning':
        toast.warning(notification.title, {
          description: notification.message,
          duration: newNotification.duration,
        });
        break;
      case 'error':
        toast.error(notification.title, {
          description: notification.message,
          duration: newNotification.duration,
          action: notification.action ? {
            label: notification.action.label,
            onClick: notification.action.onClick,
          } : undefined,
        });
        break;
      case 'info':
        toast.info(notification.title, {
          description: notification.message,
          duration: newNotification.duration,
        });
        break;
    }
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({
      type: 'error',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    showNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    toast.dismiss();
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showWarning,
    showError,
    showInfo,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {/* Container pour les notifications persistantes */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <NotificationComponent
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook utilitaire pour les notifications avec retry
export const useNotificationWithRetry = () => {
  const { showError, showSuccess } = useNotifications();

  const showErrorWithRetry = useCallback((
    title: string,
    message: string,
    retryFn: () => Promise<void>
  ) => {
    showError(title, message, {
      action: {
        label: 'Réessayer',
        onClick: retryFn,
      },
      persistent: true,
    });
  }, [showError]);

  const showSuccessWithAction = useCallback((
    title: string,
    message: string,
    actionLabel: string,
    actionFn: () => void
  ) => {
    showSuccess(title, message, {
      action: {
        label: actionLabel,
        onClick: actionFn,
      },
    });
  }, [showSuccess]);

  return {
    showErrorWithRetry,
    showSuccessWithAction,
  };
};
