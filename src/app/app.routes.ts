import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { CompaniesComponent } from './features/companies/companies.component';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicGuard] // Solo accesible si NO está autenticado
  },
  {
    path: '',
    canActivate: [authGuard], // Proteger todas las rutas hijas
    children: [
      {
        path: 'companies',
        loadComponent: () => import('./features/companies/companies.component').then(m => m.CompaniesComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
      },
      {
        path: 'customers',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent),
          },
          {
            path: ':id',  
            loadComponent: () => import('./features/customers/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent),
          }
        ]
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'invoices',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/invoices/invoices.component').then(m => m.InvoicesComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent),
          }
        ]
      },
      {
        path: 'payments',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/payments/payments.component').then(m => m.PaymentsComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/payments/payment-form/payment-form.component').then(m => m.PaymentFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/payments/payment-detail/payment-detail.component').then(m => m.PaymentDetailComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/payments/payment-form/payment-form.component').then(m => m.PaymentFormComponent),
          }
        ]
      },
      {
        path: 'purchase-orders',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/purchase-orders/purchase-orders.component').then(m => m.PurchaseOrdersComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/purchase-orders/purchase-order-form/purchase-order-form.component').then(m => m.PurchaseOrderFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/purchase-orders/purchase-order-detail/purchase-order-detail.component').then(m => m.PurchaseOrderDetailComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/purchase-orders/purchase-order-form/purchase-order-form.component').then(m => m.PurchaseOrderFormComponent),
          }
        ]
      },
      {
        path: 'quotations',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/quotations/quotations.component').then(m => m.QuotationsComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./features/quotations/quotation-form/quotation-form.component').then(m => m.QuotationFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/quotations/quotation-detail/quotation-detail.component').then(m => m.QuotationDetailComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/quotations/quotation-form/quotation-form.component').then(m => m.QuotationFormComponent),
          }
        ]
      },
      {
        path: 'reporting',
        loadComponent: () => import('./features/reporting/reporting.component').then(m => m.ReportingComponent),
      },
      {
        path: 'pos',
        children: [
          {
            path: 'sales',
            children: [
              {
                path: '',
                loadComponent: () => import('./features/pos/pos-sales/pos-sales.component').then(m => m.POSSalesComponent),
              },
              {
                path: 'new',
                loadComponent: () => import('./features/pos/pos-sale-form/pos-sale-form.component').then(m => m.POSSaleFormComponent),
              },
              {
                path: ':id',
                loadComponent: () => import('./features/pos/pos-sale-detail/pos-sale-detail.component').then(m => m.POSSaleDetailComponent),
              }
            ]
          },
          {
            path: 'sessions',
            children: [
              {
                path: '',
                loadComponent: () => import('./features/pos/pos-sessions/pos-sessions.component').then(m => m.POSSessionsComponent),
              },
              {
                path: 'open',
                loadComponent: () => import('./features/pos/pos-session-open/pos-session-open.component').then(m => m.POSSessionOpenComponent),
              },
              {
                path: ':id/close',
                loadComponent: () => import('./features/pos/pos-session-close/pos-session-close.component').then(m => m.POSSessionCloseComponent),
              }
            ]
          }
        ]
      },
      // Otras rutas protegidas
      { path: '', redirectTo: '/companies', pathMatch: 'full' },
    ]
  },
  // Redirección por defecto
  { path: '**', redirectTo: '/companies' }
];