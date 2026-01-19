import React from 'react';
import { 
  AlertTriangle, 
  LogOut, 
  Trash2, 
  Edit3, 
  User,
  FileText,
  Save,
  X,
  Mail,
  UserX,
  UserCheck,
  Shield
} from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  isLoading = false,
  data 
}) => {
  if (!isOpen) return null;

  const getModalConfig = () => {
    const configs = {
      'delete-assistant': {
        icon: Trash2,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100',
        confirmColor: 'bg-red-600 hover:bg-red-700',
        title: 'Delete Assistant',
        message: 'Are you sure you want to delete this assistant? This action cannot be undone.'
      },
      'update-permissions': {
        icon: Shield,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
        confirmColor: 'bg-blue-600 hover:bg-blue-700',
        title: 'Update Permissions',
        message: 'Are you sure you want to update permissions for this assistant?'
      },
      'deactivate-assistant': {
        icon: UserX,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-100',
        confirmColor: 'bg-amber-600 hover:bg-amber-700',
        title: 'Deactivate Assistant',
        message: 'Are you sure you want to deactivate this assistant? They will lose access to the system.'
      },
      'activate-assistant': {
        icon: UserCheck,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-100',
        confirmColor: 'bg-green-600 hover:bg-green-700',
        title: 'Activate Assistant',
        message: 'Are you sure you want to activate this assistant?'
      },
      'logout-admin': {
        icon: LogOut,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-100',
        confirmColor: 'bg-orange-600 hover:bg-orange-700',
        title: 'Logout Admin',
        message: 'Are you sure you want to logout from admin panel?'
      },
      'logout-assistant': {
        icon: LogOut,
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-100',
        confirmColor: 'bg-purple-600 hover:bg-purple-700',
        title: 'Logout Assistant',
        message: 'Are you sure you want to logout this assistant?'
      }
    };

    // Use custom title/message if provided, otherwise use defaults
    return {
      ...(configs[type] || {
        icon: AlertTriangle,
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-100',
        confirmColor: 'bg-gray-600 hover:bg-gray-700',
        title: title || 'Confirmation',
        message: message || 'Are you sure you want to proceed?'
      }),
      title: title || configs[type]?.title || 'Confirmation',
      message: message || configs[type]?.message || 'Are you sure you want to proceed?'
    };
  };

  const config = getModalConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {config.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-gray-600 mb-2">{config.message}</p>
          
          {/* Show additional data if provided */}
          {data && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              {data.name && (
                <p className="text-sm font-medium text-gray-900">
                  <User className="w-4 h-4 inline mr-2" />
                  {data.name}
                </p>
              )}
              {data.email && (
                <p className="text-sm text-gray-600 mt-1">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {data.email}
                </p>
              )}
              {data.assistantType && (
                <p className="text-sm text-gray-600 mt-1">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Type: {data.assistantType}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 ${config.confirmColor} text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;