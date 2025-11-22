// ticket-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ITicket } from '../../interfaces/tickets/ticket.interface';
import { TicketsService } from './tickets.service';

/**
 * Servicio de estado global para tickets
 * Gestiona el estado compartido entre componentes usando RxJS
 */
@Injectable({
  providedIn: 'root'
})
export class TicketStateService {
  private ticketsSubject = new BehaviorSubject<ITicket[]>([]);
  public tickets$ = this.ticketsSubject.asObservable();

  private selectedTicketSubject = new BehaviorSubject<ITicket | null>(null);
  public selectedTicket$ = this.selectedTicketSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private ticketsService: TicketsService) {}

  /**
   * Carga tickets de una compañía
   */
  async loadTickets(companyId: string): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      this.ticketsService.getTicketsByCompany(companyId).subscribe({
        next: (response) => {
          this.ticketsSubject.next(response.data);
          this.loadingSubject.next(false);
        },
        error: (error) => {
          console.error('Error loading tickets:', error);
          this.errorSubject.next('Error al cargar los tickets');
          this.loadingSubject.next(false);
        }
      });
    } catch (error) {
      console.error('Error loading tickets:', error);
      this.errorSubject.next('Error al cargar los tickets');
      this.loadingSubject.next(false);
    }
  }

  /**
   * Selecciona un ticket
   */
  selectTicket(ticket: ITicket | null): void {
    this.selectedTicketSubject.next(ticket);
  }

  /**
   * Refresca un ticket específico
   */
  async refreshTicket(ticketId: string): Promise<void> {
    try {
      this.ticketsService.getTicketById(ticketId).subscribe({
        next: (response) => {
          const ticket = response.data;
          const tickets = this.ticketsSubject.value;
          const index = tickets.findIndex(t => t.id === ticketId);

          if (index !== -1) {
            tickets[index] = ticket;
            this.ticketsSubject.next([...tickets]);
          }

          // Si es el ticket seleccionado, actualizarlo también
          if (this.selectedTicketSubject.value?.id === ticketId) {
            this.selectedTicketSubject.next(ticket);
          }
        },
        error: (error) => {
          console.error('Error refreshing ticket:', error);
          this.errorSubject.next('Error al actualizar el ticket');
        }
      });
    } catch (error) {
      console.error('Error refreshing ticket:', error);
      this.errorSubject.next('Error al actualizar el ticket');
    }
  }

  /**
   * Agrega un nuevo ticket al estado
   */
  addTicket(ticket: ITicket): void {
    const tickets = this.ticketsSubject.value;
    this.ticketsSubject.next([ticket, ...tickets]);
  }

  /**
   * Actualiza un ticket en el estado
   */
  updateTicket(updatedTicket: ITicket): void {
    const tickets = this.ticketsSubject.value;
    const index = tickets.findIndex(t => t.id === updatedTicket.id);

    if (index !== -1) {
      tickets[index] = updatedTicket;
      this.ticketsSubject.next([...tickets]);
    }

    // Si es el ticket seleccionado, actualizarlo también
    if (this.selectedTicketSubject.value?.id === updatedTicket.id) {
      this.selectedTicketSubject.next(updatedTicket);
    }
  }

  /**
   * Elimina un ticket del estado
   */
  removeTicket(ticketId: string): void {
    const tickets = this.ticketsSubject.value;
    this.ticketsSubject.next(tickets.filter(t => t.id !== ticketId));

    // Si es el ticket seleccionado, limpiarlo
    if (this.selectedTicketSubject.value?.id === ticketId) {
      this.selectedTicketSubject.next(null);
    }
  }

  /**
   * Limpia el estado
   */
  clear(): void {
    this.ticketsSubject.next([]);
    this.selectedTicketSubject.next(null);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }

  /**
   * Obtiene el valor actual de tickets
   */
  get currentTickets(): ITicket[] {
    return this.ticketsSubject.value;
  }

  /**
   * Obtiene el valor actual del ticket seleccionado
   */
  get currentSelectedTicket(): ITicket | null {
    return this.selectedTicketSubject.value;
  }
}
