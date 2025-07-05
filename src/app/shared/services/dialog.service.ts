import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class DialogService {
  info(message: string, title = 'Info') {
    return Swal.fire(title, message, 'info');
  }

  success(message: string, title = 'Success') {
    return Swal.fire(title, message, 'success');
  }

  error(message: string, title = 'Oops!') {
    return Swal.fire(title, message, 'error');
  }

  warning(message: string, title = 'Atenção') {
    return Swal.fire(title, message, 'warning');
  }

  custom(options: SweetAlertOptions) {
    return Swal.fire(options);
  }
}
