import React, { useState } from 'react';
import { CreditCard, User, Bell, Shield, CheckCircle, Plus, Trash2 } from 'lucide-react';

interface BankAccount {
  id: number;
  name: string;
  bank: string;
  number: string;
  isDefault: boolean;
}

interface AccountSettingsProps {
  bankAccounts: BankAccount[];
  onAddBankAccount: (accountData: { name: string; bank: string; accountNumber: string; isDefault: boolean }) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ bankAccounts, onAddBankAccount }) => {
  const [activeTab, setActiveTab] = useState<'payment' | 'profile' | 'notifications' | 'security'>('payment');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accountData, setAccountData] = useState({
    name: '',
    bank: '',
    accountNumber: '',
    isDefault: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBankAccount(accountData);
    setAccountData({
      name: '',
      bank: '',
      accountNumber: '',
      isDefault: false
    });
    setShowAddAccount(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
        
        <div className="flex flex-col sm:flex-row border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'payment'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4 inline-block mr-2" />
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline-block mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell className="w-4 h-4 inline-block mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'security'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="w-4 h-4 inline-block mr-2" />
            Security
          </button>
        </div>
        
        {activeTab === 'payment' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-medium text-gray-900">Bank Accounts</h4>
              <button
                onClick={() => setShowAddAccount(!showAddAccount)}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Account
              </button>
            </div>
            
            {showAddAccount && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Add New Bank Account</h5>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Name
                      </label>
                      <input
                        id="account-name"
                        type="text"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={accountData.name}
                        onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="bank-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        id="bank-name"
                        type="text"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={accountData.bank}
                        onChange={(e) => setAccountData({ ...accountData, bank: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        id="account-number"
                        type="text"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={accountData.accountNumber}
                        onChange={(e) => setAccountData({ ...accountData, accountNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      id="default-account"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={accountData.isDefault}
                      onChange={(e) => setAccountData({ ...accountData, isDefault: e.target.checked })}
                    />
                    <label htmlFor="default-account" className="ml-2 text-sm text-gray-700">
                      Set as default payment account
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setShowAddAccount(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Account
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {bankAccounts.length > 0 ? (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{account.name}</span>
                          {account.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {account.bank} • {account.number}
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No bank accounts added yet</p>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Add your first bank account
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Profile settings coming soon</p>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Notification settings coming soon</p>
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Security settings coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings; 