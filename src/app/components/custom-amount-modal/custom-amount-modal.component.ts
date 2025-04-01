// src/app/components/custom-amount-modal/custom-amount-modal.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Account } from '../../services/auth.service';

@Component({
  selector: 'app-custom-amount-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Retiro Personalizado</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label class="form-label">Monto a retirar</label>
        <input type="number" class="form-control form-control-lg" [(ngModel)]="customAmount"
               placeholder="Ingrese el monto" min="1" [disabled]="isLoading">
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()" 
              [disabled]="isLoading">Cancelar</button>
      <button type="button" class="btn btn-success" (click)="confirmWithdraw()" 
              [disabled]="!customAmount || isLoading">
        Retirar
      </button>
    </div>
  `,
  styleUrls: []
})
export class CustomAmountModalComponent {
  @Input() customAmount: number = 0;
  @Input() isLoading: boolean = false;
  @Input() selectedAccount: Account | null = null;

  constructor(public activeModal: NgbActiveModal) { }

  confirmWithdraw(): void {
    if (this.customAmount > 0) {
      this.activeModal.close({ amount: this.customAmount });
    }
  }
}