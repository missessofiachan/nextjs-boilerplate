const eyeIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
    <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/>
    <circle cx="12" cy="12" r="2.5"/>
  </svg>`

const eyeOffIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
    <path d="m3 3 18 18M10.6 6.2A9.3 9.3 0 0 1 12 6c6.1 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.8M6.5 6.6C3.9 8.4 2.5 12 2.5 12s3.4 6 9.5 6a9.4 9.4 0 0 0 3.4-.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
  </svg>`

export const DEMO_ACCOUNTS = {
  parent: {
    id: 'parent',
    roleLabel: 'Parent / Carer Demo',
    name: 'Sarah Mitchell',
    initials: 'SM',
    email: 'parent@hartwellps.vic.edu.au',
    password: 'HartwellParent2026!',
    targetUrl: './index.html?screen=s7',
    targetTitle: 'Parent Geofence Portal (S7)',
  },
  teacher: {
    id: 'teacher',
    roleLabel: 'Teacher Demo (Year 4B)',
    name: 'Ms. Lin',
    initials: 'ML',
    email: 'teacher@hartwellps.vic.edu.au',
    password: 'HartwellTeacher2026!',
    targetUrl: './index.html?screen=s8',
    targetTitle: 'Classroom Smartboard Leaderboard (S8)',
  },
  admin: {
    id: 'admin',
    roleLabel: 'School Admin Demo',
    name: 'Kim Le',
    initials: 'KL',
    email: 'admin@hartwellps.vic.edu.au',
    password: 'HartwellAdmin2026!',
    targetUrl: './index.html?screen=s6',
    targetTitle: 'Admin Hub Roll Call & KPIs (S6)',
  },
}

document.querySelectorAll('[data-demo-account]').forEach((button) => {
  button.addEventListener('click', () => {
    const account = DEMO_ACCOUNTS[button.dataset.demoAccount]
    const form = document.querySelector('[data-auth-form]')
    if (!account || !form) return

    const emailInput = form.querySelector('input[name="email"]')
    const passInput = form.querySelector('input[name="password"]')
    const firstInput = form.querySelector('input[name="firstName"]')
    const lastInput = form.querySelector('input[name="lastName"]')
    const confirmInput = form.querySelector('input[name="confirmPassword"]')
    const consentInput = form.querySelector('input[name="consent"]')

    if (emailInput) emailInput.value = account.email
    if (passInput) passInput.value = account.password
    if (firstInput) firstInput.value = 'Sarah'
    if (lastInput) lastInput.value = 'Mitchell'
    if (confirmInput) confirmInput.value = account.password
    if (consentInput) consentInput.checked = true

    form.querySelectorAll('.field-error').forEach((el) => {
      el.style.display = 'none'
    })
    form.querySelectorAll('input').forEach((el) => {
      el.setAttribute('aria-invalid', 'false')
    })

    const status = form.querySelector('[role="status"]')
    if (status) {
      status.textContent = `Demo credentials loaded for ${account.name} (${account.roleLabel}). Click submit to open ${account.targetTitle}.`
      status.style.display = 'block'
    }
  })
})

document.querySelectorAll('[data-password-toggle]').forEach((button) => {
  const input = document.getElementById(button.dataset.passwordToggle)
  if (!input) return

  button.innerHTML = eyeIcon
  button.addEventListener('click', () => {
    const showing = input.type === 'text'
    input.type = showing ? 'password' : 'text'
    button.innerHTML = showing ? eyeIcon : eyeOffIcon
    button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password')
  })
})

document.querySelectorAll('[data-auth-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    let valid = true

    form.querySelectorAll('input[required]').forEach((input) => {
      const field = input.closest('.field')
      const error = field?.querySelector('.field-error')
      const isCheckbox = input.type === 'checkbox'
      const hasValue = isCheckbox ? input.checked : input.value.trim().length > 0
      const isEmailValid =
        input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
      const isPasswordValid =
        input.type !== 'password' || input.value.length >= Number(input.minLength || 0)
      const inputValid = hasValue && isEmailValid && isPasswordValid

      input.setAttribute('aria-invalid', String(!inputValid))
      if (error) error.style.display = inputValid ? 'none' : 'block'
      if (!inputValid && valid) input.focus()
      valid = valid && inputValid
    })

    const confirm = form.querySelector('[data-confirm-password]')
    if (confirm) {
      const original = form.querySelector('[data-new-password]')
      const error = confirm.closest('.field')?.querySelector('.field-error')
      const matches = Boolean(original && confirm.value === original.value)
      confirm.setAttribute('aria-invalid', String(!matches))
      if (error) {
        error.textContent = matches ? '' : 'Passwords must match.'
        error.style.display = matches ? 'none' : 'block'
      }
      if (!matches && valid) confirm.focus()
      valid = valid && matches
    }

    if (!valid) return

    const emailVal = form.querySelector('input[name="email"]')?.value.trim().toLowerCase() || ''
    const matchedDemo = Object.values(DEMO_ACCOUNTS).find(
      (acc) => acc.email.toLowerCase() === emailVal
    )
    const activeDemo = matchedDemo || DEMO_ACCOUNTS.parent

    const status = form.querySelector('[role="status"]')
    if (status) {
      status.textContent = `Signed in as ${activeDemo.name} (${activeDemo.roleLabel}). Redirecting to ${activeDemo.targetTitle}...`
      status.style.display = 'block'
      status.focus()
    }
    window.location.href = activeDemo.targetUrl
  })
})
