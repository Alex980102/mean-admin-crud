import { Hospital } from './../../models/hospital.model';
import { Medico } from './../../models/medico.model';
import { Usuario } from './../../models/usuario.model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BusquedasService } from 'src/app/services/busquedas.service';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.component.html',
  styles: [
  ]
})
export class BusquedaComponent implements OnInit {

  public usuarios: Usuario[] = [];
  public medicos: Medico[] = [];
  public hospitales: Hospital[] = [];

  constructor( private activatedRoute: ActivatedRoute, private busquedasService: BusquedasService ) { }

  ngOnInit(): void {

    this.activatedRoute.params
      .subscribe(({termino}) => this.busquedaGlobal(termino));
  }

  busquedaGlobal(termino: string){
    this.busquedasService.busquedaGlobal(termino)
      .subscribe((res: any) => {
        console.log(res);
        this.usuarios = res.usuarios;
        this.medicos = res.medicos;
        this.hospitales = res.hospitales;
      });
  }

  abrirMedico(medico: Medico){
    console.log(medico);
  }
}
