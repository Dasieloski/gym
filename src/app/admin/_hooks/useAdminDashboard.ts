"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { ClientType } from "@/types/client";
import { Booking } from "@/types/booking";
import dayjs from "@/lib/dayjs";

interface User {
  id: string;
  rol: string;
  nombre: string;
  foto: string;
}

interface Historial {
  id: string;
  accion: string;
  descripcion: string;
  usuario: { nombre: string };
  entrenador?: { usuario: { nombre: string } };
  membresia?: { tipo: string };
  reserva?: { fecha: string };
  fecha: string;
}

export function useAdminDashboard() {
  const [sortBy, setSortBy] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: number | null;
    type: string;
  }>({ isOpen: false, id: null, type: "" });
  const [trainers, setTrainers] = useState<{ id: number; nombre: string }[]>([]);
  const [entrenadoresList, setEntrenadoresList] = useState<ClientType[]>([]);
  const [otrosList, setOtrosList] = useState<ClientType[]>([]);
  const [editingClient, setEditingClient] = useState<{
    id: number;
    nombre: string;
    telefono: string;
    entrenadorAsignadoId: string | null;
    rol: string;
  } | null>(null);
  const [clientes, setClientes] = useState<ClientType[]>([]);
  const [clientesEspera, setClientesEspera] = useState<ClientType[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userRoles, setUserRoles] = useState<User[]>([]);
  const [historiales, setHistoriales] = useState<Historial[]>([]);
  const [clientesConMembresia, setClientesConMembresia] = useState<ClientType[]>([]);
  const [searchClients, setSearchClients] = useState("");
  const [searchNewClients, setSearchNewClients] = useState("");
  const [searchMemberships, setSearchMemberships] = useState("");
  const [searchHistory, setSearchHistory] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [previousIngresosMensuales, setPreviousIngresosMensuales] = useState(0);
  const [previousTotalClientes, setPreviousTotalClientes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesProximosPagos, setClientesProximosPagos] = useState<ClientType[]>([]);
  const itemsPerPage = 10;
  const [membresiasHoy, setMembresiasHoy] = useState<number>(0);
  const [incomeStartDate, setIncomeStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [incomeEndDate, setIncomeEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [precios, setPrecios] = useState<Record<string, string>>({});
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientType | null>(null);
  const [ingresosEnRango, setIngresosEnRango] = useState<number>(0);
  const [selectedMembership, setSelectedMembership] = useState<{
    [key: number]: {
      tipo: string;
      isAdvanced: boolean;
      countDaysWithoutPayment: boolean;
    };
  }>({});
  const [sortedMemberships, setSortedMemberships] = useState<ClientType[]>([]);
  const [clientsPage, setClientsPage] = useState(1);
  const [clientsPerPage, setClientsPerPage] = useState(10);
  const [membershipsPage, setMembershipsPage] = useState(1);
  const [membershipsPerPage, setMembershipsPerPage] = useState(10);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsPerPage, setBookingsPerPage] = useState(10);
  const [searchBookings, setSearchBookings] = useState("");
  const [filterBookingDate, setFilterBookingDate] = useState("");
  const [newClientsPage, setNewClientsPage] = useState(1);
  const [newClientsPerPage, setNewClientsPerPage] = useState(10);
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesPerPage, setRolesPerPage] = useState(10);

  const [clientsViewMode, setClientsViewMode] = useState<"cards" | "list">("cards");
  const [clientsFilterMembership, setClientsFilterMembership] = useState("all");
  const [clientsFilterTrainer, setClientsFilterTrainer] = useState("all");

  const [membershipsViewMode, setMembershipsViewMode] = useState<"cards" | "list">("cards");
  const [membershipsFilterType, setMembershipsFilterType] = useState("all");
  const [membershipsFilterStatus, setMembershipsFilterStatus] = useState("all");

  const [bookingsViewMode, setBookingsViewMode] = useState<"cards" | "list">("cards");
  const [bookingsFilterStatus, setBookingsFilterStatus] = useState("all");
  const [bookingsFilterTrainer, setBookingsFilterTrainer] = useState("all");

  const [newClientsViewMode, setNewClientsViewMode] = useState<"cards" | "list">("cards");

  // Helpers
  const getProperty = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const isValidDate = (date: any): boolean => {
    return !isNaN(Date.parse(date));
  };

  const sortItems = useCallback(
    function <T extends { id: string | number }>(items: T[], sortBy: string): T[] {
      if (!sortBy) return items;

      let field = sortBy;
      let direction: "asc" | "desc" = "asc";

      if (sortBy.endsWith("Asc")) {
        field = sortBy.slice(0, -3);
        direction = "asc";
      } else if (sortBy.endsWith("Desc")) {
        field = sortBy.slice(0, -4);
        direction = "desc";
      }

      return [...items].sort((a, b) => {
        const aValue = getProperty(a, field);
        const bValue = getProperty(b, field);

        if (isValidDate(aValue) && isValidDate(bValue)) {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return direction === "asc"
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    },
    []
  );

  const calculateDaysUntilPayment = useCallback((fechaFin: string): number => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diferenciaTiempo = fin.getTime() - hoy.getTime();
    const dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
    return dias;
  }, []);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "2-digit" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const getPrecio = (tipo: string): number => {
    switch (tipo) {
      case "MENSUAL": return parseInt(precios.PRECIO_MENSUAL || "2000");
      case "TRIMESTRAL": return parseInt(precios.PRECIO_TRIMESTRAL || "10000");
      case "ANUAL": return parseInt(precios.PRECIO_ANUAL || "20000");
      default: return 0;
    }
  };

  const calculateIngresosEnRango = useCallback(() => {
    if (!incomeStartDate || !incomeEndDate || Object.keys(precios).length === 0) return 0;
    const start = new Date(incomeStartDate);
    const end = new Date(incomeEndDate);
    end.setHours(23, 59, 59, 999);

    return clientesConMembresia.reduce((sum, client) => {
      if (!client.membresias || !Array.isArray(client.membresias)) return sum;
      return sum + client.membresias.reduce((mSum, membresia) => {
        const fechaInicio = new Date(membresia.fechaInicio);
        if (fechaInicio >= start && fechaInicio <= end) {
          return mSum + getPrecio(membresia.tipo);
        }
        return mSum;
      }, 0);
    }, 0);
  }, [incomeStartDate, incomeEndDate, precios, clientesConMembresia]);

  useEffect(() => {
    setIngresosEnRango(calculateIngresosEnRango());
  }, [calculateIngresosEnRango]);

  const getAdditionalDays = (tipo: string): number => {
    switch (tipo.toUpperCase()) {
      case "ANUAL":
        return 365;
      case "TRIMESTRAL":
        return 180;
      case "MENSUAL":
        return 30;
      default:
        return 30;
    }
  };

  // Computed filters
  const filteredClients = Array.isArray(clientes)
    ? clientes.filter(
        (client: ClientType) =>
          client.nombre?.toLowerCase().includes(searchClients.toLowerCase()) ||
          client.carnetIdentidad?.toLowerCase().includes(searchClients.toLowerCase()) ||
          client.telefono?.toLowerCase().includes(searchClients.toLowerCase())
      )
    : [];

  const filteredNewClients = Array.isArray(clientesEspera)
    ? clientesEspera.filter(
        (client: ClientType) =>
          client.nombre.toLowerCase().includes(searchNewClients.toLowerCase()) ||
          (client.username?.toLowerCase() || "").includes(searchNewClients.toLowerCase()) ||
          client.carnetIdentidad.toLowerCase().includes(searchNewClients.toLowerCase())
      )
    : [];

  const filteredMemberships = Array.isArray(clientesConMembresia)
    ? clientesConMembresia.filter(
        (client: ClientType) =>
          client.nombre.toLowerCase().includes(searchMemberships.toLowerCase()) ||
          client.membresiaActual?.tipo.toLowerCase().includes(searchMemberships.toLowerCase())
      )
    : [];

  const filteredHistory = Array.isArray(historiales)
    ? historiales.filter(
        (item: Historial) =>
          item.accion.toLowerCase().includes(searchHistory.toLowerCase()) ||
          item.descripcion.toLowerCase().includes(searchHistory.toLowerCase()) ||
          item.usuario.nombre.toLowerCase().includes(searchHistory.toLowerCase())
      )
    : [];

  const filteredUsers = Array.isArray(userRoles)
    ? userRoles.filter(
        (user: User) =>
          user.nombre.toLowerCase().includes(searchUsers.toLowerCase()) ||
          user.rol.toLowerCase().includes(searchUsers.toLowerCase())
      )
    : [];

  const filtrarClientesProximosPagos = useCallback(
    (clientes: ClientType[]) => {
      return clientes
        .filter((cliente) => {
          if (cliente.membresiaActual) {
            const diasParaPagar = calculateDaysUntilPayment(cliente.membresiaActual.fechaFin);
            return diasParaPagar <= 10 && diasParaPagar > 0;
          }
          return false;
        })
        .map((cliente) => ({
          ...cliente,
          diasParaPagar: calculateDaysUntilPayment(cliente.membresiaActual!.fechaFin),
        }));
    },
    [calculateDaysUntilPayment]
  );

  useEffect(() => {
    const clientesFiltrados = filtrarClientesProximosPagos(clientesConMembresia);
    setClientesProximosPagos(clientesFiltrados);
  }, [clientesConMembresia, filtrarClientesProximosPagos]);

  useEffect(() => {
    const contarMembresiasHoy = () => {
      const hoy = dayjs().startOf("day");
      let contador = 0;

      clientesConMembresia.forEach((client) => {
        if (client.membresias && Array.isArray(client.membresias)) {
          client.membresias.forEach((membresia) => {
            const fechaCreacion = dayjs(membresia.createdAt).startOf("day");
            if (fechaCreacion.isSame(hoy, "day")) {
              contador += 1;
            }
          });
        }

        if (client.membresiaActual) {
          const yaContada = client.membresias?.some((m) => m.id === client.membresiaActual?.id);
          if (!yaContada) {
            const fechaCreacionActual = dayjs(client.membresiaActual.createdAt).startOf("day");
            if (fechaCreacionActual.isSame(hoy, "day")) {
              contador += 1;
            }
          }
        }
      });

      setMembresiasHoy(contador);
    };

    contarMembresiasHoy();
  }, [clientesConMembresia]);

  const totalClientes = userRoles.filter((user: User) => user.rol === "CLIENTE").length;

  const ingresosMensuales = clientesConMembresia.reduce((sum, client) => {
    const membresia = client.membresiaActual;
    if (!membresia) return sum;

    const inicio = new Date(membresia.fechaInicio);
    const hoy = new Date();
    const mismoMes = inicio.getMonth() === hoy.getMonth();
    const mismoAnio = inicio.getFullYear() === hoy.getFullYear();

    if (membresia.tipo === "MENSUAL") {
      return sum + 2000;
    } else if (membresia.tipo === "TRIMESTRAL") {
      if (mismoMes && mismoAnio) {
        return sum + 10000;
      }
    } else if (membresia.tipo === "ANUAL") {
      if (mismoMes && mismoAnio) {
        return sum + 20000;
      }
    }
    return sum;
  }, 0);

  useEffect(() => {
    setPreviousIngresosMensuales(ingresosMensuales);
    setPreviousTotalClientes(totalClientes);
  }, [ingresosMensuales, totalClientes]);

  const ingresosPorcentaje = previousIngresosMensuales
    ? ((ingresosMensuales - previousIngresosMensuales) / previousIngresosMensuales) * 100
    : 0;
  const clientesPorcentaje = previousTotalClientes
    ? ((totalClientes - previousTotalClientes) / previousTotalClientes) * 100
    : 0;

  // Data fetching
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/admin/bookings");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener las reservas");
        }
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error al obtener las reservas:", error as Error);
        toast.error(`Error al cargar las reservas: ${(error as Error).message}`);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchHistoriales = async () => {
      try {
        const response = await fetch("/api/historial");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHistoriales(data);
      } catch (error) {
        console.error("Error al obtener los historiales:", error);
      }
    };

    fetchHistoriales();
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/admin/config");
        if (response.ok) {
          const data = await response.json();
          setPrecios(data);
        }
      } catch (error) {
        console.error("Error al obtener configuración:", error);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await fetch("/api/admin/memberships");
        if (!response.ok) {
          throw new Error("Error al obtener las membresías");
        }
        const data = await response.json();
        setClientesConMembresia(data);
      } catch (error) {
        console.error("Error al obtener las membresías:", error);
        toast.error(`Error al cargar las membresías: ${(error as Error).message}`);
      }
    };

    fetchMemberships();
  }, []);

  useEffect(() => {
    const fetchNewClients = async () => {
      try {
        const response = await fetch("/api/admin/newClients");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener los nuevos clientes");
        }
        const data = await response.json();
        setClientesEspera(data);
      } catch (error) {
        console.error("Error al obtener los nuevos clientes:", error);
        toast.error(`Error al cargar los nuevos clientes: ${(error as Error).message}`);
      }
    };

    fetchNewClients();
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/clientes");
      const data = await response.json();
      setClientes(data.clientes);
      setEntrenadoresList(data.entrenadores || []);
      setOtrosList(data.otros || []);
      setTrainers(data.entrenadoresDropdown || data.entrenadores);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const fetchUserRoles = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/roles");
      if (!response.ok) {
        throw new Error("Error al obtener los roles de usuario");
      }
      const data = await response.json();
      setUserRoles(data);
    } catch (error) {
      console.error("Error al obtener los roles de usuario:", error);
      toast.error("Error al cargar los roles de usuario");
    }
  }, []);

  useEffect(() => {
    fetchUserRoles();
  }, [fetchUserRoles]);

  // Handlers
  const confirmDelete = async () => {
    if (deleteConfirmation.id && deleteConfirmation.type) {
      try {
        const response = await fetch(
          `/api/admin/${deleteConfirmation.type === "client" ? "clientes" : "bookings"}?id=${deleteConfirmation.id}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error desconocido al eliminar el elemento");
        }

        if (deleteConfirmation.type === "client") {
          await fetchAllUsers();
          toast.success("Usuario eliminado con éxito");
        } else if (deleteConfirmation.type === "booking") {
          setBookings((prevBookings) =>
            prevBookings.filter((booking: { id: number }) => booking.id !== deleteConfirmation.id)
          );
          toast.success("Reserva eliminada con éxito");
        }

        setDeleteConfirmation({ isOpen: false, id: null, type: "" });
      } catch (error) {
        console.error(`Error al eliminar el ${deleteConfirmation.type}:`, error);
        toast.error(`Error al eliminar el ${deleteConfirmation.type}: ${(error as Error).message}`);
      }
    }
  };

  const handleDelete = (id: number | null, type: string) => {
    setDeleteConfirmation({ isOpen: true, id, type });
  };

  const handleEditClient = (
    client: {
      id: number;
      nombre: string;
      telefono: string;
      entrenadorAsignadoId: string | null;
      rol: string;
    } | null
  ) => {
    setEditingClient(client);
  };

  const handleSaveClient = async (newPassword?: string) => {
    if (!editingClient) {
      console.error("No hay cliente en edición");
      return;
    }

    try {
      const body: {
        id: number;
        nombre: string;
        telefono: string;
        entrenadorAsignadoId: string | null;
        rol: string;
        password?: string;
      } = {
        id: editingClient.id,
        nombre: editingClient.nombre,
        telefono: editingClient.telefono,
        entrenadorAsignadoId: editingClient.entrenadorAsignadoId,
        rol: editingClient.rol,
      };

      if (newPassword && newPassword.trim() !== "") {
        body.password = newPassword;
      }

      const response = await fetch("/api/admin/clientes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido al actualizar el cliente");
      }

      await response.json();
      await fetchAllUsers();
      setEditingClient(null);
      toast.success("Usuario editado con éxito");
    } catch (error) {
      console.error("Error al guardar el cliente:", error);
      toast.error(`Error al guardar el cliente: ${(error as Error).message}`);
    }
  };

  const handleConvertToClient = async (id: number) => {
    try {
      const response = await fetch(`/api/newClients`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido al convertir el cliente");
      }

      const updatedUser = await response.json();
      setClientesEspera((prevClientes) =>
        prevClientes.filter((c: { id: number }) => c.id !== updatedUser.id)
      );
      toast.success("Cliente convertido con éxito");
      fetchUserRoles();
    } catch (error: any) {
      console.error("Error al convertir el cliente:", error);
      toast.error(`Error al convertir el cliente: ${error.message}`);
    }
  };

  const handleRejectClient = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/newClients?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido al rechazar el cliente");
      }

      setClientesEspera((prevClientes) =>
        prevClientes.filter((c: { id: number }) => c.id !== id)
      );
      toast.success("Cliente rechazado y eliminado");
      fetchUserRoles();
    } catch (error: any) {
      console.error("Error al rechazar el cliente:", error);
      toast.error(`Error al rechazar el cliente: ${error.message}`);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSignOut = () => {
    window.location.href = "/";
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rol: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido al actualizar el rol");
      }

      await response.json();
      toast.success("Rol actualizado con éxito");
      fetchUserRoles();
    } catch (error) {
      console.error("Error al actualizar el rol del usuario:", error);
      toast.error(`Error al actualizar el rol: ${(error as Error).message}`);
    }
  };

  const handleSortChange = (field: string) => {
    setSortBy(field);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchHistory, sortBy]);

  const handleMembershipChange = async (
    clientId: number,
    newMembershipType: string,
    isAdvanced: boolean,
    countDaysWithoutPayment: boolean
  ) => {
    try {
      const requestBody: any = { clientId, tipo: newMembershipType };

      if (isAdvanced) {
        requestBody.descripcion = "adelantado";
      }

      if (countDaysWithoutPayment) {
        const client = clientesConMembresia.find((c) => c.id === clientId);
        if (client && client.membresiaActual) {
          const diasSinPago = calculateDaysUntilPayment(client.membresiaActual.fechaFin);

          let additionalDays = 0;
          if (newMembershipType === "MENSUAL") {
            additionalDays = 30 - diasSinPago;
          } else if (newMembershipType === "ANUAL") {
            additionalDays = 365 - diasSinPago;
          } else if (newMembershipType === "TRIMESTRAL") {
            additionalDays = 180;
          }

          if (additionalDays < 0) additionalDays = 0;

          requestBody.additionalDays = additionalDays;
          requestBody.countDaysWithoutPayment = true;
        } else {
          const hoy = new Date();
          const diasDeMembresia = getAdditionalDays(newMembershipType);
          const fin = new Date(hoy.getTime() + diasDeMembresia * 24 * 60 * 60 * 1000);
          requestBody.fechaInicio = hoy.toISOString();
          requestBody.fechaFin = fin.toISOString();
          requestBody.countDaysWithoutPayment = false;
        }
      } else {
        const client = clientesConMembresia.find((c) => c.id === clientId);
        let nuevaFechaInicio: string;
        let nuevaFechaFin: string;

        if (client && client.membresiaActual) {
          const fechaFinActual = new Date(client.membresiaActual.fechaFin);
          const hoy = new Date();
          const inicio = fechaFinActual > hoy ? fechaFinActual : hoy;
          nuevaFechaInicio = inicio.toISOString();

          const diasDeMembresia = getAdditionalDays(newMembershipType);
          const fin = new Date(inicio.getTime() + diasDeMembresia * 24 * 60 * 60 * 1000);
          nuevaFechaFin = fin.toISOString();
        } else {
          const hoy = new Date();
          nuevaFechaInicio = hoy.toISOString();

          const diasDeMembresia = getAdditionalDays(newMembershipType);
          const fin = new Date(hoy.getTime() + diasDeMembresia * 24 * 60 * 60 * 1000);
          nuevaFechaFin = fin.toISOString();
        }

        requestBody.fechaInicio = nuevaFechaInicio;
        requestBody.fechaFin = nuevaFechaFin;
      }

      const response = await fetch("/api/admin/updateMembership", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la membresía");
      }

      const updatedClient: ClientType = await response.json();
      setClientesConMembresia((prev) =>
        prev.map((client: ClientType) => (client.id === updatedClient.id ? updatedClient : client))
      );
      toast.success("Membresía actualizada con éxito");
    } catch (error) {
      console.error("Error al actualizar la membresía:", error);
      toast.error(`Error al actualizar la membresía: ${(error as Error).message}`);
    }
  };

  // Membresías sorted effect
  useEffect(() => {
    let filtered = clientesConMembresia.filter(
      (client) =>
        client.nombre.toLowerCase().includes(searchMemberships.toLowerCase()) ||
        client.id.toString().includes(searchMemberships) ||
        client.membresiaActual?.tipo.toLowerCase().includes(searchMemberships.toLowerCase())
    );

    filtered = filtered.filter((client) => {
      const tipo = client.membresiaActual?.tipo || "";
      if (membershipsFilterType !== "all" && tipo !== membershipsFilterType) return false;
      const dias = client.membresiaActual
        ? calculateDaysUntilPayment(client.membresiaActual.fechaFin)
        : null;
      if (membershipsFilterStatus !== "all") {
        if (membershipsFilterStatus === "active" && !(dias !== null && dias >= 0)) return false;
        if (membershipsFilterStatus === "expired" && !(dias !== null && dias < 0)) return false;
      }
      return true;
    });

    const membresiasConDias = filtered.map((client) => {
      const diasParaPagar = client.membresiaActual
        ? calculateDaysUntilPayment(client.membresiaActual.fechaFin)
        : 0;
      return { ...client, diasParaPagar };
    });

    const sorted = sortItems(membresiasConDias, sortBy);
    setSortedMemberships(sorted);
  }, [
    sortBy,
    clientesConMembresia,
    searchMemberships,
    membershipsFilterType,
    membershipsFilterStatus,
    sortItems,
    calculateDaysUntilPayment,
  ]);

  // Charts / stats computed values
  const calcularAsistenciaMensual = () => {
    const asistenciaMensual: number[] = Array(12).fill(0);
    const clientesPorMes: Set<number>[] = Array.from({ length: 12 }, () => new Set());

    bookings.forEach((booking) => {
      const fecha = new Date(booking.fecha);
      const mes = fecha.getMonth();
      clientesPorMes[mes].add(booking.cliente.id);
    });

    clientesPorMes.forEach((clientesSet, mes) => {
      asistenciaMensual[mes] = clientesSet.size;
    });

    return asistenciaMensual;
  };

  const asistenciaMensual = calcularAsistenciaMensual();

  const ingresosUltimosMeses = useMemo(() => {
    const meses: { label: string; value: number }[] = [];
    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const ahora = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mes = d.getMonth();
      const anio = d.getFullYear();
      let total = 0;
      clientesConMembresia.forEach((client: any) => {
        if (!client.membresias) return;
        client.membresias.forEach((m: any) => {
          const fecha = new Date(m.fechaInicio);
          if (fecha.getMonth() === mes && fecha.getFullYear() === anio) {
            total += getPrecio(m.tipo);
          }
        });
      });
      meses.push({ label: mesesNombres[mes], value: total });
    }
    return meses;
  }, [clientesConMembresia, precios]);

  const barChartData = [
    { label: "Ene", value: asistenciaMensual[0] },
    { label: "Feb", value: asistenciaMensual[1] },
    { label: "Mar", value: asistenciaMensual[2] },
    { label: "Abr", value: asistenciaMensual[3] },
    { label: "May", value: asistenciaMensual[4] },
    { label: "Jun", value: asistenciaMensual[5] },
    { label: "Jul", value: asistenciaMensual[6] },
    { label: "Ago", value: asistenciaMensual[7] },
    { label: "Sep", value: asistenciaMensual[8] },
    { label: "Oct", value: asistenciaMensual[9] },
    { label: "Nov", value: asistenciaMensual[10] },
    { label: "Dic", value: asistenciaMensual[11] },
  ];

  const totalMensual = clientesConMembresia.filter(
    (client: { membresiaActual?: { tipo: string } }) => client.membresiaActual?.tipo === "MENSUAL"
  ).length;
  const totalTrimestral = clientesConMembresia.filter(
    (client: { membresiaActual?: { tipo: string } }) => client.membresiaActual?.tipo === "TRIMESTRAL"
  ).length;
  const totalAnual = clientesConMembresia.filter(
    (client: { membresiaActual?: { tipo: string } }) => client.membresiaActual?.tipo === "ANUAL"
  ).length;

  const pieChartData = [
    { label: "Mensual", value: totalMensual, color: "#2272FF" },
    { label: "Trimestral", value: totalTrimestral, color: "#02F5D4" },
    { label: "Anual", value: totalAnual, color: "#ffffff" },
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistorial = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  // Paginación computada
  const advancedFilteredClients = filteredClients.filter((client: ClientType) => {
    const dias = client.membresiaActual
      ? calculateDaysUntilPayment(client.membresiaActual.fechaFin)
      : null;
    if (clientsFilterMembership !== "all") {
      if (clientsFilterMembership === "active" && !(dias !== null && dias >= 0)) return false;
      if (clientsFilterMembership === "expired" && !(dias !== null && dias < 0)) return false;
      if (clientsFilterMembership === "none" && dias !== null) return false;
    }
    if (clientsFilterTrainer !== "all") {
      if (clientsFilterTrainer === "none" && client.entrenadorAsignado) return false;
      if (
        clientsFilterTrainer !== "none" &&
        client.entrenadorAsignado?.id.toString() !== clientsFilterTrainer
      )
        return false;
    }
    return true;
  });

  const sortedClients = sortItems(advancedFilteredClients, sortBy);
  const paginatedClients = sortedClients.slice(
    (clientsPage - 1) * clientsPerPage,
    clientsPage * clientsPerPage
  );
  const totalClientPages = Math.max(1, Math.ceil(sortedClients.length / clientsPerPage));

  const paginatedMemberships = sortedMemberships.slice(
    (membershipsPage - 1) * membershipsPerPage,
    membershipsPage * membershipsPerPage
  );
  const totalMembershipPages = Math.max(
    1,
    Math.ceil(sortedMemberships.length / membershipsPerPage)
  );

  const filteredBookings = (bookings || []).filter((b: Booking) => {
    const matchesSearch =
      !searchBookings ||
      b.cliente?.nombre?.toLowerCase().includes(searchBookings.toLowerCase()) ||
      b.entrenadorNombre?.toLowerCase().includes(searchBookings.toLowerCase());
    const matchesDate = filterBookingDate
      ? dayjs(b.fecha).format("YYYY-MM-DD") === filterBookingDate
      : true;
    return matchesSearch && matchesDate;
  });

  const advancedFilteredBookings = filteredBookings.filter((b: Booking) => {
    if (bookingsFilterStatus !== "all" && b.estado !== bookingsFilterStatus) return false;
    if (bookingsFilterTrainer !== "all" && b.entrenadorNombre !== bookingsFilterTrainer) return false;
    return true;
  });

  const sortedBookings = sortItems<Booking>(advancedFilteredBookings, sortBy);
  const paginatedBookings = sortedBookings.slice(
    (bookingsPage - 1) * bookingsPerPage,
    bookingsPage * bookingsPerPage
  );
  const totalBookingPages = Math.max(1, Math.ceil(sortedBookings.length / bookingsPerPage));

  const sortedNewClients = sortItems(filteredNewClients, sortBy);
  const paginatedNewClients = sortedNewClients.slice(
    (newClientsPage - 1) * newClientsPerPage,
    newClientsPage * newClientsPerPage
  );
  const totalNewClientPages = Math.max(1, Math.ceil(sortedNewClients.length / newClientsPerPage));

  const sortedUsers = sortItems(filteredUsers, sortBy);
  const paginatedUsers = sortedUsers.slice((rolesPage - 1) * rolesPerPage, rolesPage * rolesPerPage);
  const totalRolePages = Math.max(1, Math.ceil(sortedUsers.length / rolesPerPage));

  return {
    // State
    sortBy,
    setSortBy,
    deleteConfirmation,
    setDeleteConfirmation,
    trainers,
    editingClient,
    setEditingClient,
    clientes,
    clientesEspera,
    activeTab,
    setActiveTab,
    bookings,
    userRoles,
    historiales,
    clientesConMembresia,
    searchClients,
    setSearchClients,
    searchNewClients,
    setSearchNewClients,
    searchMemberships,
    setSearchMemberships,
    searchHistory,
    setSearchHistory,
    searchUsers,
    setSearchUsers,
    previousIngresosMensuales,
    previousTotalClientes,
    currentPage,
    setCurrentPage,
    clientesProximosPagos,
    membresiasHoy,
    selectedMembership,
    setSelectedMembership,
    sortedMemberships,
    clientsPage,
    setClientsPage,
    clientsPerPage,
    setClientsPerPage,
    membershipsPage,
    setMembershipsPage,
    membershipsPerPage,
    setMembershipsPerPage,
    bookingsPage,
    setBookingsPage,
    bookingsPerPage,
    setBookingsPerPage,
    searchBookings,
    setSearchBookings,
    filterBookingDate,
    setFilterBookingDate,
    newClientsPage,
    setNewClientsPage,
    newClientsPerPage,
    setNewClientsPerPage,
    rolesPage,
    setRolesPage,
    rolesPerPage,
    setRolesPerPage,
    clientsViewMode,
    setClientsViewMode,
    clientsFilterMembership,
    setClientsFilterMembership,
    clientsFilterTrainer,
    setClientsFilterTrainer,
    membershipsViewMode,
    setMembershipsViewMode,
    membershipsFilterType,
    setMembershipsFilterType,
    membershipsFilterStatus,
    setMembershipsFilterStatus,
    bookingsViewMode,
    setBookingsViewMode,
    bookingsFilterStatus,
    setBookingsFilterStatus,
    bookingsFilterTrainer,
    setBookingsFilterTrainer,
    newClientsViewMode,
    setNewClientsViewMode,
    incomeStartDate,
    setIncomeStartDate,
    incomeEndDate,
    setIncomeEndDate,
    ingresosEnRango,
    selectedClientDetail,
    setSelectedClientDetail,

    entrenadoresList,
    otrosList,

    // Computed
    filteredClients,
    filteredNewClients,
    filteredMemberships,
    filteredHistory,
    filteredUsers,
    totalClientes,
    ingresosMensuales,
    ingresosPorcentaje,
    clientesPorcentaje,
    asistenciaMensual,
    ingresosUltimosMeses,
    barChartData,
    totalMensual,
    totalTrimestral,
    totalAnual,
    pieChartData,
    currentHistorial,
    totalPages,
    advancedFilteredClients,
    sortedClients,
    paginatedClients,
    totalClientPages,
    paginatedMemberships,
    totalMembershipPages,
    filteredBookings,
    advancedFilteredBookings,
    sortedBookings,
    paginatedBookings,
    totalBookingPages,
    sortedNewClients,
    paginatedNewClients,
    totalNewClientPages,
    sortedUsers,
    paginatedUsers,
    totalRolePages,

    // Helpers
    calculateDaysUntilPayment,
    formatDate,
    getAdditionalDays,
    sortItems,

    // Handlers
    confirmDelete,
    handleDelete,
    handleEditClient,
    handleSaveClient,
    handleConvertToClient,
    handleRejectClient,
    handleTabChange,
    handleSignOut,
    handleSortChange,
    handleNextPage,
    handlePrevPage,
    handlePageSelect,
    handleMembershipChange,
    handleUpdateRole,
    fetchUserRoles,
  };
}
