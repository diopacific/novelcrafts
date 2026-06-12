import React, { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';
import { Button } from './ui/button';

export function KeySettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem('gemini_api_key') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    alert('저장되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Key className="w-4 h-4 mr-2 text-indigo-500" />
            개인 Gemini API 키 설정
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            일일 무료 크레딧이 모두 소진되었거나, 무제한으로 AI를 활용하고 싶다면 직접 발급받은 <strong>Gemini API 키</strong>를 입력하세요.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              API Key
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            입력하신 키는 서버에 저장되지 않으며, 사용자 기기(브라우저)에만 안전하게 보관됩니다. API 키는 구글 AI 스튜디오 홈페이지에서 무료로 발급받을 수 있습니다.
          </p>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>저장하기</Button>
        </div>
      </div>
    </div>
  );
}
