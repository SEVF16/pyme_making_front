// ticket-disclaimer.directive.ts
import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

/**
 * Directiva para mostrar el disclaimer legal de forma destacada
 * Uso: <div appTicketDisclaimer>...</div>
 */
@Directive({
  selector: '[appTicketDisclaimer]',
  standalone: true
})
export class TicketDisclaimerDirective implements OnInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const disclaimer = this.renderer.createElement('div');
    this.renderer.addClass(disclaimer, 'ticket-disclaimer');

    const text = this.renderer.createText('⚠️ ESTE DOCUMENTO NO ES VÁLIDO COMO BOLETA TRIBUTARIA');
    this.renderer.appendChild(disclaimer, text);

    // Estilos
    this.renderer.setStyle(disclaimer, 'background-color', '#fff3cd');
    this.renderer.setStyle(disclaimer, 'color', '#856404');
    this.renderer.setStyle(disclaimer, 'padding', '12px 16px');
    this.renderer.setStyle(disclaimer, 'border', '2px solid #ffc107');
    this.renderer.setStyle(disclaimer, 'border-radius', '4px');
    this.renderer.setStyle(disclaimer, 'font-weight', 'bold');
    this.renderer.setStyle(disclaimer, 'text-align', 'center');
    this.renderer.setStyle(disclaimer, 'margin', '16px 0');
    this.renderer.setStyle(disclaimer, 'font-size', '14px');

    // Insertar antes del elemento
    this.renderer.insertBefore(
      this.el.nativeElement.parentNode,
      disclaimer,
      this.el.nativeElement
    );
  }
}
