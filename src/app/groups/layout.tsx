import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Group Chats - WhatsApp SaaS',
  description: 'Manage your WhatsApp groups and monitor conversations',
};

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
