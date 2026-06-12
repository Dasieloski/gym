"use client";

import { BarChart, Users, CreditCard, Calendar, UserPlus, FileText, Package, History, ScrollText, Settings, UserPlus2, StickyNote, DollarSign, LogIn, Snowflake, Bell, Target, Dumbbell, TrendingUp, Award } from "lucide-react";
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAdminDashboard } from "./_hooks/useAdminDashboard";
import ConfirmationDialog from "./_components/ConfirmationDialog";
import DashboardTab from "./_components/DashboardTab";
import ClientsTab from "./_components/ClientsTab";
import MembershipsTab from "./_components/MembershipsTab";
import BookingsTab from "./_components/BookingsTab";
import NewClientsTab from "./_components/NewClientsTab";
import HistoryTab from "./_components/HistoryTab";
import ReportsTab from "./_components/ReportsTab";
import InventoryTab from "./_components/InventoryTab";
import LogsTab from "./_components/LogsTab";
import ConfigTab from "./_components/ConfigTab";
import CreateClientTab from "./_components/CreateClientTab";
import NotesTab from "./_components/NotesTab";
import ExpensesTab from "./_components/ExpensesTab";
import CheckInTab from "./_components/CheckInTab";
import FreezeTab from "./_components/FreezeTab";
import RecordatoriosTab from "./_components/RecordatoriosTab";
import MetasTab from "./_components/MetasTab";
import RutinasTab from "./_components/RutinasTab";
import ExecutiveTab from "./_components/ExecutiveTab";
import RetentionTab from "./_components/RetentionTab";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: <BarChart size={18} /> },
  { id: "executive", label: "Executive", icon: <TrendingUp size={18} /> },
  { id: "retention", label: "Retención", icon: <Award size={18} /> },
  { id: "checkin", label: "Check-In", icon: <LogIn size={18} /> },
  { id: "clients", label: "Clientes", icon: <Users size={18} /> },
  { id: "createClient", label: "Crear Cliente", icon: <UserPlus2 size={18} /> },
  { id: "memberships", label: "Membresías", icon: <CreditCard size={18} /> },
  { id: "freeze", label: "Congelar", icon: <Snowflake size={18} /> },
  { id: "metas", label: "Metas", icon: <Target size={18} /> },
  { id: "rutinas", label: "Rutinas", icon: <Dumbbell size={18} /> },
  { id: "recordatorios", label: "Recordatorios", icon: <Bell size={18} /> },
  { id: "notes", label: "Notas", icon: <StickyNote size={18} /> },
  { id: "expenses", label: "Gastos", icon: <DollarSign size={18} /> },
  { id: "bookings", label: "Reservas", icon: <Calendar size={18} /> },
  { id: "newClients", label: "Nuevos", icon: <UserPlus size={18} /> },
  { id: "reports", label: "Reportes", icon: <FileText size={18} /> },
  { id: "inventory", label: "Inventario", icon: <Package size={18} /> },
  { id: "history", label: "Historial", icon: <History size={18} /> },
  { id: "config", label: "Configuración", icon: <Settings size={18} /> },
  { id: "logs", label: "Logs", icon: <ScrollText size={18} /> },
];

export default function AdminDashboard() {
  const hook = useAdminDashboard();
  const [recordatoriosCount, setRecordatoriosCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/admin/recordatorios?dias=5");
        if (res.ok) {
          const data = await res.json();
          setRecordatoriosCount(data.total || 0);
        }
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItemsWithBadges = navItems.map((item) => {
    if (item.id === "recordatorios") {
      return { ...item, badge: recordatoriosCount };
    }
    return item;
  });

  const renderTab = () => {
    switch (hook.activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            totalClientes={hook.totalClientes}
            clientesPorcentaje={hook.clientesPorcentaje}
            ingresosMensuales={hook.ingresosMensuales}
            ingresosPorcentaje={hook.ingresosPorcentaje}
            clientesConMembresia={hook.clientesConMembresia}
            membresiasHoy={hook.membresiasHoy}
            userRoles={hook.userRoles}
            clientesProximosPagos={hook.clientesProximosPagos}
            clientesEspera={hook.clientesEspera}
            clientes={hook.clientes}
            bookings={hook.bookings}
            historiales={hook.historiales}
            asistenciaMensual={hook.asistenciaMensual}
            ingresosUltimosMeses={hook.ingresosUltimosMeses}
            pieChartData={hook.pieChartData}
            totalMensual={hook.totalMensual}
            totalTrimestral={hook.totalTrimestral}
            totalAnual={hook.totalAnual}
            calculateDaysUntilPayment={hook.calculateDaysUntilPayment}
            incomeStartDate={hook.incomeStartDate}
            setIncomeStartDate={hook.setIncomeStartDate}
            incomeEndDate={hook.incomeEndDate}
            setIncomeEndDate={hook.setIncomeEndDate}
            ingresosEnRango={hook.ingresosEnRango}
          />
        );
      case "clients":
        return (
          <ClientsTab
            searchClients={hook.searchClients}
            setSearchClients={hook.setSearchClients}
            sortBy={hook.sortBy}
            setSortBy={hook.setSortBy}
            clientsPage={hook.clientsPage}
            setClientsPage={hook.setClientsPage}
            clientsPerPage={hook.clientsPerPage}
            setClientsPerPage={hook.setClientsPerPage}
            clientsFilterMembership={hook.clientsFilterMembership}
            setClientsFilterMembership={hook.setClientsFilterMembership}
            clientsFilterTrainer={hook.clientsFilterTrainer}
            setClientsFilterTrainer={hook.setClientsFilterTrainer}
            clientsViewMode={hook.clientsViewMode}
            setClientsViewMode={hook.setClientsViewMode}
            trainers={hook.trainers}
            paginatedClients={hook.paginatedClients}
            totalClientPages={hook.totalClientPages}
            sortedClientsLength={hook.sortedClients.length}
            sortedClients={hook.sortedClients}
            editingClient={hook.editingClient}
            setEditingClient={hook.setEditingClient}
            handleEditClient={hook.handleEditClient}
            handleSaveClient={hook.handleSaveClient}
            handleDelete={hook.handleDelete}
            calculateDaysUntilPayment={hook.calculateDaysUntilPayment}
            entrenadoresList={hook.entrenadoresList}
            otrosList={hook.otrosList}
          />
        );
      case "memberships":
        return (
          <MembershipsTab
            searchMemberships={hook.searchMemberships}
            setSearchMemberships={hook.setSearchMemberships}
            sortBy={hook.sortBy}
            setSortBy={hook.setSortBy}
            membershipsPage={hook.membershipsPage}
            setMembershipsPage={hook.setMembershipsPage}
            membershipsPerPage={hook.membershipsPerPage}
            setMembershipsPerPage={hook.setMembershipsPerPage}
            membershipsFilterType={hook.membershipsFilterType}
            setMembershipsFilterType={hook.setMembershipsFilterType}
            membershipsFilterStatus={hook.membershipsFilterStatus}
            setMembershipsFilterStatus={hook.setMembershipsFilterStatus}
            membershipsViewMode={hook.membershipsViewMode}
            setMembershipsViewMode={hook.setMembershipsViewMode}
            clientesProximosPagos={hook.clientesProximosPagos}
            paginatedMemberships={hook.paginatedMemberships}
            totalMembershipPages={hook.totalMembershipPages}
            sortedMembershipsLength={hook.sortedMemberships.length}
            selectedMembership={hook.selectedMembership}
            setSelectedMembership={hook.setSelectedMembership}
            handleMembershipChange={hook.handleMembershipChange}
            formatDate={hook.formatDate}
            calculateDaysUntilPayment={hook.calculateDaysUntilPayment}
            selectedClientDetail={hook.selectedClientDetail}
            setSelectedClientDetail={hook.setSelectedClientDetail}
          />
        );
      case "bookings":
        return (
          <BookingsTab
            searchBookings={hook.searchBookings}
            setSearchBookings={hook.setSearchBookings}
            filterBookingDate={hook.filterBookingDate}
            setFilterBookingDate={hook.setFilterBookingDate}
            sortBy={hook.sortBy}
            setSortBy={hook.setSortBy}
            bookingsPage={hook.bookingsPage}
            setBookingsPage={hook.setBookingsPage}
            bookingsPerPage={hook.bookingsPerPage}
            setBookingsPerPage={hook.setBookingsPerPage}
            bookingsFilterStatus={hook.bookingsFilterStatus}
            setBookingsFilterStatus={hook.setBookingsFilterStatus}
            bookingsFilterTrainer={hook.bookingsFilterTrainer}
            setBookingsFilterTrainer={hook.setBookingsFilterTrainer}
            bookingsViewMode={hook.bookingsViewMode}
            setBookingsViewMode={hook.setBookingsViewMode}
            trainers={hook.trainers}
            paginatedBookings={hook.paginatedBookings}
            totalBookingPages={hook.totalBookingPages}
            sortedBookingsLength={hook.sortedBookings.length}
            handleDelete={hook.handleDelete}
          />
        );
      case "newClients":
        return (
          <NewClientsTab
            searchNewClients={hook.searchNewClients}
            setSearchNewClients={hook.setSearchNewClients}
            sortBy={hook.sortBy}
            setSortBy={hook.setSortBy}
            newClientsPage={hook.newClientsPage}
            setNewClientsPage={hook.setNewClientsPage}
            newClientsPerPage={hook.newClientsPerPage}
            setNewClientsPerPage={hook.setNewClientsPerPage}
            newClientsViewMode={hook.newClientsViewMode}
            setNewClientsViewMode={hook.setNewClientsViewMode}
            paginatedNewClients={hook.paginatedNewClients}
            totalNewClientPages={hook.totalNewClientPages}
            sortedNewClientsLength={hook.sortedNewClients.length}
            handleConvertToClient={hook.handleConvertToClient}
            handleRejectClient={hook.handleRejectClient}
          />
        );
      case "history":
        return (
          <HistoryTab
            searchHistory={hook.searchHistory}
            setSearchHistory={hook.setSearchHistory}
            sortBy={hook.sortBy}
            setSortBy={hook.setSortBy}
            filteredHistory={hook.filteredHistory}
          />
        );
      case "executive":
        return <ExecutiveTab />;
      case "retention":
        return <RetentionTab />;
      case "reports":
        return <ReportsTab />;
      case "inventory":
        return <InventoryTab />;
      case "config":
        return <ConfigTab />;
      case "createClient":
        return <CreateClientTab />;
      case "notes":
        return <NotesTab />;
      case "expenses":
        return <ExpensesTab />;
      case "checkin":
        return <CheckInTab />;
      case "freeze":
        return <FreezeTab />;
      case "metas":
        return <MetasTab />;
      case "rutinas":
        return <RutinasTab />;
      case "recordatorios":
        return <RecordatoriosTab />;
      case "logs":
        return <LogsTab />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      navItems={navItemsWithBadges}
      activeTab={hook.activeTab}
      onTabChange={hook.handleTabChange}
      onSignOut={hook.handleSignOut}
    >
      {renderTab()}
      <ConfirmationDialog
        isOpen={hook.deleteConfirmation.isOpen}
        onClose={() => hook.setDeleteConfirmation({ isOpen: false, id: null, type: "" })}
        onConfirm={hook.confirmDelete}
        message="¿Está seguro de que desea eliminar este elemento?"
      />
    </DashboardLayout>
  );
}
