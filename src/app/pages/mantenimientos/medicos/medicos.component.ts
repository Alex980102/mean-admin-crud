import { delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { BusquedasService } from './../../../services/busquedas.service';
import { ModalImagenService } from './../../../services/modal-imagen.service';
import { Medico } from './../../../models/medico.model';
import { MedicoService } from './../../../services/medico.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.component.html',
  styles: [
  ]
})
export class MedicosComponent implements OnInit, OnDestroy {

  public cargando: boolean = true;
  public medicos: Medico[] = [];
  private counter: number = 0;
  private imgSubs: Subscription;

  constructor(private medicoService: MedicoService, private modalImageService: ModalImagenService, private busquedasService: BusquedasService) { }
  ngOnDestroy(): void {
    this.imgSubs.unsubscribe()
  }

  ngOnInit(): void {
    this.cargarMedicos();

    this.imgSubs = this.modalImageService.nuevaImagen
      .pipe(delay(100))
      .subscribe(img => this.cargarMedicos());
  }

  cargarMedicos(){
    this.cargando = true;
    this.medicoService.caragrMedicos()
        .subscribe(medicos=>{
          this.cargando = false;
          this.medicos = medicos;
          console.log(this.medicos.length);

        })
  }

  abrirModal(medico: Medico){
    this.modalImageService.abrirModal('medico', medico._id, medico.img);
  }

  buscar(termino: string){
    if (termino.length === 0){
      this.counter = 0;
      return this.cargarMedicos();
    }


    this.busquedasService.buscar('medicos', termino)
        .subscribe((res: Medico[]) => {
          this.medicos = res;
          if (this.medicos.length === 0 && this.counter === 0) {
            this.counter++;
            Swal.fire('Error', 'Usuario no encontrado', 'warning')
          }
        })

  }

  borrarMedico(medico: Medico){
    Swal.fire({
      title: `¿Borrar Médico?`,
      text: `Está a punto de borrar al médico ${medico.nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, deseo borrar al medico'
    }).then((result) => {
      if (result.value) {
        this.medicoService.borrarMedico(medico)
          .subscribe(res => {
            this.cargarMedicos();
            Swal.fire(
              'Medico borrado',
              `${medico.nombre} fue elimindado correctamente`,
              'success');

            })
      }
    })
  }
}
