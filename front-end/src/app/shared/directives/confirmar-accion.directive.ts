import { Directive, HostListener, output } from '@angular/core';

@Directive({
    selector: '[appConfirmAction]',
    standalone: true
})

export class ConfirmarAccionDirective {
    readonly appConfirmAction = output<void>();

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        event.preventDefault();
        this.appConfirmAction.emit();
    }
}
