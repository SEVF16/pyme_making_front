import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';


export type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';
export type SidebarSize = 'small' | 'medium' | 'large' | 'full';

export interface SimpleSidebarConfig {
  position?: SidebarPosition;
  size?: SidebarSize;
  width?: string;
  height?: string;
  modal?: boolean;
  closable?: boolean;
}
@Component({
  selector: 'app-sidebar-view',
  standalone: true,
  imports: [SidebarModule, NgTemplateOutlet ],
  templateUrl: './sidebar-view.component.html',
  styleUrl: './sidebar-view.component.scss'
})
export class SidebarViewComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() title?: string;
  @Input() data?: any;
  @Input() config: SimpleSidebarConfig = {};

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  @ContentChild('content') contentTemplate?: TemplateRef<any>;
  @ContentChild('footer') footerTemplate?: TemplateRef<any>;

  get sidebarStyles() {
    const styles: any = {};
    
    if (this.config.width) {
      styles.width = this.config.width;
    }
    
    if (this.config.height) {
      styles.height = this.config.height;
    }
    
    return styles;
  }
  ngOnInit(): void {
    console.log(this.title);
  }
  getSizeClass(): string {
    if (this.config.size) {
      return `sidebar-${this.config.size}`;
    }
    return 'sidebar-medium';
  }

  open(): void {
    this.visible = true;
    this.visibleChange.emit(true);
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onClose.emit();
  }

  toggle(): void {
    this.visible ? this.close() : this.open();
  }
}
