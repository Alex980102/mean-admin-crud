import { FileUploadService } from './../../services/file-upload.service';
import { Component, OnInit } from '@angular/core';
import { ModalImagenService } from './../../services/modal-imagen.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-image',
  templateUrl: './modal-image.component.html',
  styles: [
  ]
})
export class ModalImageComponent implements OnInit {

  public imagenSubir: File;
  public imgTemp: any = null;

  constructor(public modalImageService: ModalImagenService, public fileUploadService: FileUploadService) { }

  ngOnInit(): void {
  }

  cerrarModal(){
    this.imgTemp = null;
    this.modalImageService.cerrarModal();
  }

  cambiarImagen(file: File){
    this.imagenSubir = file;
    if (!file) {
      return this.imgTemp = null;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      this.imgTemp = reader.result;

    }
  }

  subirImagen(){
    const id = this.modalImageService.id;
    const tipo = this.modalImageService.tipo;
    this.fileUploadService
      .actualizarFoto(this.imagenSubir, tipo, id)
      .then( img => {
        Swal.fire('Guardado', 'Imagen de usuario actualizada', 'success');
        this.modalImageService.nuevaImagen.emit(img);
        this.cerrarModal();
      }, (err) => {
        console.log(err);
        Swal.fire('Error', err.error.msg, 'error');
      });

  }

}
