'use client';

import ConversationPage from '../../../../app/messages/[conversationId]/page';
import Link from 'next/link';

export default function DashboardConversationPage({ params }: { params: { conversationId: string } }) {
  return <ConversationPage params={params} />;
} 