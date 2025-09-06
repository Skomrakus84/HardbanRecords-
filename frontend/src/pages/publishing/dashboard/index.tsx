import { useEffect, useState } from 'react';
import DashboardCard from '../../components/publishing/DashboardCard';
import SalesWidget from '../../components/publishing/widgets/SalesWidget';
import RecentProjectsWidget from '../../components/publishing/widgets/RecentProjectsWidget';
import NotificationsWidget from '../../components/publishing/widgets/NotificationsWidget';
import QuickActions from '../../components/publishing/QuickActions';
import BookGrid from '../../components/publishing/BookGrid';
import CreateBookButton from '../../components/publishing/CreateBookButton';

export default function PublishingDashboard() {
  const [books, setBooks] = useState([]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <DashboardCard title="Podsumowanie Sprzedaży">
        <SalesWidget />
      </DashboardCard>
      
      <DashboardCard title="Ostatnie Projekty">
        <RecentProjectsWidget />
      </DashboardCard>
      
      <DashboardCard title="Powiadomienia">
        <NotificationsWidget />
      </DashboardCard>
      
      <DashboardCard title="Szybkie Akcje" className="col-span-full">
        <QuickActions />
      </DashboardCard>

      <div className="col-span-full mt-8">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Biblioteka</h1>
          <CreateBookButton />
        </div>
        
        <BookGrid books={books} />
      </div>
    </div>
  );
}