import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {UsuarioService} from '../../services/usuario.service'; 
import Swal from 'sweetalert2'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: [ './register.component.css' ]
})
export class RegisterComponent {

  public formSubmitted = false;

  public registerForm = this.fb.group({
    nombre: ['Alejandro', [Validators.required, Validators.minLength(3)]],
    email: ['test@gmail.com', [Validators.required, Validators.email]],
    password: ['1234567', Validators.required],
    password2: ['1234567', Validators.required],
    terminos: [true, Validators.required]
  },{
    validators: this.passwordsIguales('password', 'password2')
  });

  constructor( private fb: FormBuilder,
                private usuarioService: UsuarioService,
                private router: Router) {}

  crearUsuario(){
    this.formSubmitted = true;
    console.log(this.registerForm.value);
    if (this.registerForm.invalid) {
      return;
    }

    // Realizar el posteo
    this.usuarioService.crearUsuario(this.registerForm.value)
        .subscribe(resp => {
          // Navegar al dashboard 
          this.router.navigateByUrl('/');
        }, (err) => {
          Swal.fire('Error', err.error.msg, 'error');
        });
  }

  campoMoValido(campo: string):boolean{
    return true;
  }

  campoNoValido(campo: string): boolean{
    if(this.registerForm.get(campo).invalid && this.formSubmitted){
      return true;
    }else{
      return false;}
  }
  aceptaTerminos(){
    return !this.registerForm.get('terminos').value && this.formSubmitted;
  }
  contraseasValidas(){
    const pass1 = this.registerForm.get('password').value;
    const pass2 = this.registerForm.get('password2').value;
    if (!(pass1 === pass2) && this.formSubmitted) {
      return true;
    }else{
      return false;
    }
  }

  passwordsIguales(pass1Name: string, pass2Name: string){
    return (formGroup: FormGroup) => {
      const pass1Control = formGroup.get(pass1Name)
      const pass2Control = formGroup.get(pass2Name)
      if(pass1Control.value === pass2Control.value){
        pass2Control.setErrors(null);
      }else{
        pass2Control.setErrors({noEsIgual: true});
      }
    }
  }
}
