import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly busy = input(false);
  readonly title = input('Confirmar acción');
  readonly message = input('¿Deseas continuar?');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly confirmButtonClass = input('btn btn-error');
  readonly ariaLabel = input('Diálogo de confirmación');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    if (this.busy()) {
      return;
    }

    this.confirmed.emit();
  }

  onCancel(): void {
    if (this.busy()) {
      return;
    }

    this.cancelled.emit();
  }
}
