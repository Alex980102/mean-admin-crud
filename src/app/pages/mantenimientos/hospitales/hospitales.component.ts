import { BusquedasService } from './../../../services/busquedas.service';
import { delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ModalImagenService } from './../../../services/modal-imagen.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { Hospital } from './../../../models/hospital.model';
import { HospitalService } from './../../../services/hospital.service';

@Component({
  selector: 'app-hospitales',
  templateUrl: './hospitales.component.html',
  styles: [
  ]
})
export class HospitalesComponent implements OnInit, OnDestroy {

  public hospitales: Hospital[] = [];
  public cargando: boolean = true;
  private imgSubs: Subscription;

  constructor(private hospitalService: HospitalService, private modalImagenService:ModalImagenService, private busquedasService: BusquedasService) { }
  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit(): void {
this.cargarHospitales();

this.imgSubs = this.modalImagenService.nuevaImagen
    .pipe(delay(100))
    .subscribe(img => this.cargarHospitales());
  }

  buscar(termino: string){
    if (termino.length === 0) {
      return this.cargarHospitales();
    }
    this.busquedasService.buscar('hospitales', termino)
        .subscribe(res => {
          this.hospitales = res;
        });
  }

  cargarHospitales(){
    this.cargando = true;

    this.hospitalService.cargarHospitales()
        .subscribe(hospitales => {
          this.cargando = false;
          this.hospitales = hospitales;
        })
  }

  guardarCambios(hospital){
    this.hospitalService.actualizarHospital(hospital._id, hospital.nombre)
        .subscribe(res => {
          Swal.fire('Actualizado', hospital.nombre, 'success');
        });
  }

  eliminiarHospital( hospital: Hospital ){
    this.hospitalService.borrarHospital(hospital._id)
        .subscribe(res => {
          this.cargarHospitales();
          Swal.fire('Borrado', hospital.nombre, 'success');
        });
  }

  async abrirSwitAlert(){
    const {value = ''} = await Swal.fire<string>({
      title: 'Crear Hospital',
      text: "Ingrese el nombre del nuevo hospital",
      input: 'text',
      inputPlaceholder: "Nombre del hospital",
      showCancelButton: true,
    });

    if(value.trim().length > 0){
      this.hospitalService.crearHospitales(value)
          .subscribe((res: any) => {
            this.hospitales.push(res.hospital);
            Swal.fire('Hospital Creado', value, 'success');
          })
    }

  }

  abrirModal(hospital: Hospital){
    console.log(hospital.img);
    this.modalImagenService.abrirModal('hospital', hospital._id, hospital.img)
  }
}

