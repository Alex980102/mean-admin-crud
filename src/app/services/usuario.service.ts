import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

import { CargarUsuario } from './../interfaces/cargar-usuarios.interface';
import {RegisterForm} from '../interfaces/register-form.interface';
import {LoginForm} from '../interfaces/login-form.interface';
import {environment} from '../../environments/environment';
import { Usuario } from './../models/usuario.model';

const base_url = environment.base_url;

declare const gapi: any;


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public auth2: any;
  public usuario: Usuario;

  constructor(private http: HttpClient,
                private router: Router,
                private ngZone: NgZone) {
                  this.googleInit();
                }

  get token(): string {
    return localStorage.getItem('token' || '');
  }

  get role(): 'ADMIN_ROLE' | 'USER_ROLE'{
    return this.usuario.role;
  }

  get uid():string {
    return this.usuario.id || '';
  }

  get headers(){
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  guardarLocalStorage(token: string, menu: any){
    localStorage.setItem('token', token);
    localStorage.setItem('menu', JSON.stringify(menu))
  }

  googleInit(){

    return new Promise<void>(resolve => {
      gapi.load('auth2', ()=>{
        this.auth2 = gapi.auth2.init({
          client_id: '848717072039-5jr95c5tsudtqqeppj0cgai4v49u96qc.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin'
        });
        resolve();
      });
    })
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('menu');

    this.auth2.signOut().then( () => {
      this.ngZone.run(()=>{
        this.router.navigateByUrl('/login');
      });
    });
  }

  validarToken(): Observable<boolean> {

    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': this.token
      }
    }).pipe(
      map((res: any) => {
      const {email,google,id,img = '',nombre,role} = res.usuario;
      this.usuario = new Usuario(nombre, email, '', img, google, role, id);

      this.guardarLocalStorage(res.token, res.menu);

      return true;
      }),
      catchError(err => of(false))
    );
  }

  crearUsuario(formData: RegisterForm){

    return this.http.post(`${base_url}/usuarios`, formData)
                  .pipe(
                    tap((res: any) => this.guardarLocalStorage(res.token, res.menu))
                  );

  }

  actualizarPerfil(data: { email: string, nombre: string, role: string }){

    data = {
      ...data,
      role: this.usuario.role
    }

    return this.http.put(`${base_url}/usuarios/${this.uid}`, data, this.headers);
  }

  login(formData: LoginForm){

    return this.http.post(`${base_url}/login`, formData)
                .pipe(
                  tap((res: any) => this.guardarLocalStorage(res.token, res.menu))
                );

  }

  loginGoogle(token){

    return this.http.post(`${base_url}/login/google`, {token})
                .pipe(
                  tap((res: any) => this.guardarLocalStorage(res.token, res.menu))
                );

  }

  cargarusuarios(desde: number = 0){
    const url = `${base_url}/usuarios?desde=${desde}`;
    return this.http.get<CargarUsuario>(url, this.headers )
              .pipe(
                map(res => {
                  const usuarios = res.usuarios.map(user => new Usuario(user.nombre, user.email, '', user.img, user.google, user.role, user.id))
                  return {
                    total: res.total,
                    usuarios
                  };
                })
              )
  }

  eliminarUsuario(usuario: Usuario) {
    const url = `${base_url}/usuarios/${usuario.id}`
    return this.http.delete(url, this.headers);
  }

  guardarUsuario(usuario: Usuario){
    return this.http.put(`${base_url}/usuarios/${usuario.id}`, usuario, this.headers);
  }
}
