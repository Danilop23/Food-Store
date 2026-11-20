
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'

import { useLogin } from '../../features/auth/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()

  const [errorMessage, setErrorMessage] = useState('')

  const formulario = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage('')

      try {
        await login.mutateAsync(value)
        navigate('/')
      } catch {
        setErrorMessage(
          'No se pudo iniciar sesión. Verificá tu usuario y contraseña.',
        )
      }
    },
  })

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Bienvenido a Food Store</h1>
        <p>Iniciá sesión para continuar.</p>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void formulario.handleSubmit()
          }}
        >
          <formulario.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length === 0
                  ? 'Ingresá tu nombre de usuario.'
                  : undefined,
            }}
          >
            {(field) => (
              <>
                <label htmlFor={field.name}>Usuario</label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Ingresá tu usuario"
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
                  ? 'Ingresá tu contraseña.'
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
                  placeholder="Ingresá tu contraseña"
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

          <button type="submit" disabled={login.isPending}>
            {login.isPending ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-switch">
          ¿Todavía no tenés cuenta?{' '}
          <Link to="/registro">Registrate</Link>
        </p>
      </section>
    </main>
  )
}
