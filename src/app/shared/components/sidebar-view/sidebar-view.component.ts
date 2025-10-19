import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonLibComponent } from '../buttonlib/button-lib.component';
import { Plus } from 'lucide-angular';
import { SidebarConfig } from './interfaces/siderbar-config.interface';



@Component({
  selector: 'app-sidebar-view',
  standalone: true,
  imports: [SidebarModule, NgTemplateOutlet, ButtonLibComponent],
  templateUrl: './sidebar-view.component.html',
  styleUrl: './sidebar-view.component.scss'
})
export class SidebarViewComponent implements OnInit {
  readonly PlusIcon = Plus;
  
  @Input() visible: boolean = false;
  @Input() title?: string;
  @Input() data?: any;
  @Input() config: SidebarConfig  = { visible: false };
  @Input( ) isDisabled: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onShow = new EventEmitter<void>();
  @Output() onHide = new EventEmitter<void>();
  @ContentChild('content') contentTemplate?: TemplateRef<any>;
  @ContentChild('footer') footerTemplate?: TemplateRef<any>;

  get sidebarStyles() {
    const styles: any = {};
  
    
    return styles;
  }

  ngOnInit(): void {
    console.log("inic");
  }

  getSizeClass(): string {
    if (this.config.size) {
      return `sidebar-${this.config.size}`;
    }
    return 'sidebar-medium';
  }



}