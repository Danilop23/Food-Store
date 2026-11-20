
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'

import { useRegister } from '../../features/auth/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()

  const [errorMessage, setErrorMessage] = useState('')

  const formulario = useForm({
    defaultValues: {
      full_name: '',
      username: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage('')

      try {
        await register.mutateAsync(value)
        navigate('/login')
      } catch {
        setErrorMessage(
          'No se pudo crear la cuenta. Revisá los datos ingresados.',
        )
      }
    },
  })

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Crear una cuenta</h1>
        <p>Registrate para comenzar a disfrutar de Food Store.</p>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void formulario.handleSubmit()
          }}
        >
          <formulario.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length === 0
                  ? 'Ingresá tu nombre completo.'
                  : undefined,
            }}
          >
            {(field) => (
              <>
                <label htmlFor={field.name}>Nombre completo</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ingresá tu nombre"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="auth-error">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </>
            )}
          </formulario.Field>

          <formulario.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length === 0
                  ? 'Elegí un nombre de usuario.'
                  : undefined,
            }}
          >
            {(field) => (
              <>
                <label htmlFor={field.name}>Nombre de usuario</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Elegí un nombre de usuario"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="auth-error">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </>
            )}
          </formulario.Field>

          <formulario.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                  ? 'Ingresá un correo electrónico válido.'
                  : undefined,
            }}
          >
            {(field) => (
              <>
                <label htmlFor={field.name}>Correo electrónico</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="Ingresá tu correo"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="auth-error">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </>
            )}
          </formulario.Field>

          <formulario.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length === 0
                  ? 'Ingresá una contraseña.'
                  : undefined,
            }}
          >
            {(field) => (
              <>
                <label htmlFor={field.name}>Contraseña</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="Elegí una contraseña"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(event.target.value)
                  }
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="auth-error">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </>
            )}
          </formulario.Field>

          {errorMessage && (
            <p className="auth-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button type="submit" disabled={register.isPending}>
            {register.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tenés una cuenta?{' '}
          <Link to="/login">Iniciá sesión</Link>
        </p>
      </section>
    </main>
  )
}
