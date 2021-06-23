import { ModalImagenService } from './../../../services/modal-imagen.service';
import Swal from 'sweetalert2';
import { Usuario } from './../../../models/usuario.model';
import { BusquedasService } from './../../../services/busquedas.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { delay } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styles: [
  ]
})
export class UsuariosComponent implements OnInit, OnDestroy {

  public totalUsuarios: number = 0;
  public usuarios: Usuario[] = [];
  public usuariosTemp: Usuario[] = [];

  public imgSubs: Subscription;

  public desde: number = 0;
  public cargando: boolean = true;

  private counter: number = 0;

  constructor(private usuariosService: UsuarioService, private busquedasService:BusquedasService, private modalImageService:ModalImagenService) { }
  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.imgSubs = this.modalImageService.nuevaImagen
      .pipe(
        delay(100)
      )
      .subscribe(img => {
        this.cargarUsuarios()
      });
  }

  cargarUsuarios(){
    this.cargando = true;
    this.usuariosService.cargarusuarios(this.desde)
      .subscribe(({total, usuarios}) => {
        this.totalUsuarios = total;
        this.usuarios = usuarios;
        this.usuariosTemp = usuarios;
        this.cargando = false;
      });
  }

  cambiarPagina(valor: number){
    this.desde += valor;
    if(this.desde < 0){
      this.desde = 0;
    }else if(this.desde >= this.totalUsuarios){
      this.desde -= valor;
    }
    this.cargarUsuarios();
  }

  buscar(termino: string){
    if (termino.length === 0) {
      this.counter = 0;
      return this.usuarios = this.usuariosTemp;
    }
    this.busquedasService.buscar('usuarios', termino)
        .subscribe((res: Usuario[]) => {
          this.usuarios = res;
          if (res.length === 0 && this.counter === 0) {
            this.counter++;
            Swal.fire('Error', 'Usuario no encontrado', 'warning')
          }
        });
  }

  eliminarUsuario(usuario: Usuario){

    if (usuario.id === this.usuariosService.uid) {
      return Swal.fire('Error', 'No se puede borrar a usted mismo', 'error')
    }

    Swal.fire({
      title: `¿Borrar usuario?`,
      text: `Está a punto de borrar al usuario ${usuario.nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, deseo borrar al usuario'
    }).then((result) => {
      if (result.value) {
        this.usuariosService.eliminarUsuario(usuario)
          .subscribe(res => {
            this.cargarUsuarios();
            Swal.fire(
              'Usuario borrado',
              `${usuario.nombre} fue elimindado correctamente`,
              'success');

            })
      }
    })
  }

  cambiarRole(usuario: Usuario) {
    this.usuariosService.guardarUsuario(usuario)
      .subscribe(res => {
        console.log(res);

      })
  }

  abrirModal(usuario: Usuario){
    this.modalImageService.abrirModal('usuario', usuario.id, usuario.img);
  }

}
