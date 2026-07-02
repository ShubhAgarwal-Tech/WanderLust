(() => {
  'use strict'

  document.addEventListener('submit', event => {
    const form = event.target.closest('.needs-validation')
    if (!form) return
    if (!form.checkValidity()) {
      event.preventDefault()
      event.stopPropagation()
      form.classList.add('was-validated')
      return
    }
    form.classList.add('was-validated')
    const submit = form.querySelector('button[type="submit"], button:not([type])')
    if (submit) {
      submit.disabled = true
      submit.classList.add('is-loading')
      submit.dataset.originalText = submit.textContent
      submit.textContent = submit.textContent.trim() || 'Submitting...'
    }
  }, true)
})()
