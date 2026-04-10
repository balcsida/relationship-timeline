import { EventProvider } from '@/context/EventContext';
import MainLayout from '@/components/MainLayout';

function App() {
  return (
    <EventProvider>
      <MainLayout />
    </EventProvider>
  );
}

export default App;
