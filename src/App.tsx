import React, { useState } from 'react';
import { BoltStyleChat } from '../components/ui/bolt-style-chat';
import { Workspace } from './components/Workspace';
import { AIBuilderEngine } from './services/aiBuilderEngine';
import { ProjectFile, ChatMessage } from './types';

const aiBuilder = new AIBuilderEngine();

export default function App() {
  const [view, setView] = useState<'hero' | 'workspace'>('hero');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartBuilding = async (promptText: string) => {
    setCurrentPrompt(promptText);
    setView('workspace');
    setIsGenerating(true);

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString()
    };

    const assistantMsgId = 'assistant_' + Date.now();
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      steps: [
        { title: 'Analyzing requirements & designing app structure', status: 'pending' },
        { title: 'Generating HTML, CSS, & JavaScript modules', status: 'pending' },
        { title: 'Compiling assets & initializing preview environment', status: 'pending' }
      ]
    };

    setMessages([userMsg, initialAssistantMsg]);

    const generator = aiBuilder.generateProject(promptText);

    for await (const chunk of generator) {
      if (chunk.type === 'step') {
        setMessages(prev => prev.map(msg => {
          if (msg.id === assistantMsgId && msg.steps) {
            const updatedSteps = msg.steps.map(s => 
              s.title === chunk.step.title ? { ...s, status: chunk.step.status as 'running' | 'completed' | 'pending' } : s
            );
            return { ...msg, steps: updatedSteps };
          }
          return msg;
        }));
      } else if (chunk.type === 'done') {
        setFiles(chunk.files || []);
        setMessages(prev => prev.map(msg => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              content: chunk.message || '',
              filesCreated: chunk.files
            };
          }
          return msg;
        }));
      }
    }

    setIsGenerating(false);
  };

  const handleSendFollowUp = async (followUpPrompt: string) => {
    setIsGenerating(true);

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: followUpPrompt,
      timestamp: new Date().toISOString()
    };

    const assistantMsgId = 'assistant_' + Date.now();
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      steps: [
        { title: `Refactoring app based on: "${followUpPrompt}"`, status: 'running' }
      ]
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);

    const generator = aiBuilder.generateProject(followUpPrompt);

    for await (const chunk of generator) {
      if (chunk.type === 'done') {
        setFiles(chunk.files || []);
        setMessages(prev => prev.map(msg => {
          if (msg.id === assistantMsgId) {
            return {
              ...msg,
              content: `Updated project! ${chunk.message}`,
              steps: [{ title: `Refactoring app based on: "${followUpPrompt}"`, status: 'completed' }],
              filesCreated: chunk.files
            };
          }
          return msg;
        }));
      }
    }

    setIsGenerating(false);
  };

  if (view === 'workspace') {
    return (
      <Workspace
        initialPrompt={currentPrompt}
        initialFiles={files}
        initialMessages={messages}
        onBackToHome={() => setView('hero')}
        onSendFollowUp={handleSendFollowUp}
        isGenerating={isGenerating}
      />
    );
  }

  return (
    <BoltStyleChat
      title="What will you"
      subtitle="Create stunning apps & websites by chatting with AI."
      announcementText="Introducing Bolt V2"
      announcementHref="#"
      placeholder="What do you want to build?"
      onSend={handleStartBuilding}
      onImport={(source) => alert(`Importing from ${source}...`)}
    />
  );
}
