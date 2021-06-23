import { delay } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Medico } from './../../../models/medico.model';
import { MedicoService } from './../../../services/medico.service';
import { Hospital } from './../../../models/hospital.model';
import { HospitalService } from './../../../services/hospital.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-medico',
  templateUrl: './medico.component.html',
  styles: []
})
export class MedicoComponent implements OnInit {

  public medicoForm: FormGroup;
  public hospitales: Hospital[] = [];

  public medicoSeleccionado: Medico;
  public hospitalSeleccionado: Hospital;

  constructor(
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    private medicoService: MedicoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {

    this.activatedRoute.params
        .subscribe(({id}) => this.cargarMedico(id));

    this.medicoForm = this.fb.group({
      nombre: ['', Validators.required],
      hospital: ['', Validators.required]
    });
    this.cargarHospitales();
    this.medicoForm.get('hospital').valueChanges
      .subscribe(hospitalId => {
        this.hospitalSeleccionado = this.hospitales.find(h => h._id === hospitalId);
      })
  }

  cargarMedico(id: string){

    if (id === 'nuevo') {
      return;
    }

    this.medicoService.obtenerMedicoPorId(id)
        .pipe(
          delay(100)
        )
        .subscribe(medico => {
          if (!medico) {
            return this.router.navigateByUrl(`/dashboard/medicos`)
          }
          const {nombre, hospital:{_id}} = medico;
          this.medicoSeleccionado = medico;
          this.medicoForm.setValue({nombre, hospital: _id})
        })

  }

  cargarHospitales() {
    this.hospitalService.cargarHospitales()
      .subscribe((hospitales: Hospital[]) => {
        this.hospitales = hospitales
      })
  }

  guardarMedico() {

    const {
      nombre
    } = this.medicoForm.value;

    if (this.medicoSeleccionado) {
      const data = {
        ...this.medicoForm.value,
        _id: this.medicoSeleccionado._id
      }
      this.medicoService.actualizarMedico(data)
        .subscribe(res => {
          Swal.fire('Actualizado', `Médico ${nombre} guardado correctamente`, 'success');
        })
    }else{
      this.medicoService.crearMedico(this.medicoForm.value)
        .subscribe((res: any) => {
          Swal.fire('Creado', `Médico ${nombre} guardado correctamente`, 'success');
          this.router.navigateByUrl(`/dashboard/medico/${res.medico._id}`)
        })
    }


  }

}
