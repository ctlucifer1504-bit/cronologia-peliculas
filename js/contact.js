/**
 * contact.js — validación accesible del formulario y envío de sugerencias.
 *
 * Para recibir mensajes automáticamente, define un endpoint (Formspree,
 * Getform, Basin o tu propio backend) en CONTACT_ENDPOINT o mediante
 * window.CRONOLOGIA_CONTACT_ENDPOINT antes de cargar este archivo.
 *
 * Si no hay endpoint configurado, el formulario prepara un correo en el
 * cliente del visitante (mailto). Eso no almacena el mensaje en un servidor:
 * es un mecanismo de respaldo, no un backend.
 */
(() => {
    'use strict';

    const form = document.getElementById('contact-form');
    if (!form) return;

    const CONTACT_EMAIL = 'contacto@cronologia-peliculas.com';
    const CONTACT_ENDPOINT = typeof window.CRONOLOGIA_CONTACT_ENDPOINT === 'string'
        ? window.CRONOLOGIA_CONTACT_ENDPOINT.trim()
        : '';

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const privacyInput = document.getElementById('privacy');
    const honeypot = document.getElementById('website');
    const messageCount = document.getElementById('message-count');
    const submitButton = document.getElementById('submit-btn');
    const statusBox = document.getElementById('form-status');
    const fields = [nameInput, emailInput, messageInput, privacyInput].filter(Boolean);

    const notify = (message, type) => {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        }
    };

    const setFieldError = (input, message) => {
        if (!input) return;
        const field = input.closest('.form-field');
        const error = document.getElementById(`${input.id}-error`);

        if (message) {
            field?.classList.add('has-error');
            input.setAttribute('aria-invalid', 'true');
            if (error) {
                error.textContent = message;
                error.hidden = false;
            }
        } else {
            field?.classList.remove('has-error');
            input.removeAttribute('aria-invalid');
            if (error) {
                error.textContent = '';
                error.hidden = true;
            }
        }
    };

    const validateField = (input) => {
        if (!input) return true;

        const value = input.type === 'checkbox' ? input.checked : input.value.trim();

        if (input === nameInput) {
            if (!value) {
                setFieldError(input, 'Escribe tu nombre.');
                return false;
            }
            if (value.length < 2) {
                setFieldError(input, 'El nombre debe tener al menos 2 caracteres.');
                return false;
            }
        }

        if (input === emailInput) {
            if (!value) {
                setFieldError(input, 'Escribe tu correo electrónico.');
                return false;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
                setFieldError(input, 'Introduce un correo electrónico válido.');
                return false;
            }
        }

        if (input === messageInput) {
            if (!value) {
                setFieldError(input, 'Cuéntanos tu sugerencia.');
                return false;
            }
            if (value.length < 10) {
                setFieldError(input, 'El mensaje debe tener al menos 10 caracteres.');
                return false;
            }
            if (value.length > 600) {
                setFieldError(input, 'El mensaje no puede superar los 600 caracteres.');
                return false;
            }
        }

        if (input === privacyInput && !value) {
            setFieldError(input, 'Debes aceptar la política de privacidad para continuar.');
            return false;
        }

        setFieldError(input, '');
        return true;
    };

    const validateForm = () => {
        let firstInvalid = null;

        fields.forEach((input) => {
            const valid = validateField(input);
            if (!valid && !firstInvalid) firstInvalid = input;
        });

        if (firstInvalid) {
            firstInvalid.focus();
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            firstInvalid.scrollIntoView({
                block: 'center',
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
        }

        return !firstInvalid;
    };

    const updateCounter = () => {
        if (!messageInput || !messageCount) return;
        messageCount.textContent = `${messageInput.value.length}/600`;
    };

    const showStatus = (type, message) => {
        if (!statusBox) return;
        statusBox.className = `form-status is-${type}`;
        statusBox.textContent = message;
        statusBox.hidden = false;
    };

    const clearStatus = () => {
        if (!statusBox) return;
        statusBox.hidden = true;
        statusBox.textContent = '';
        statusBox.className = 'form-status';
    };

    const setLoading = (loading) => {
        if (!submitButton) return;
        submitButton.disabled = loading;
        submitButton.classList.toggle('is-loading', loading);
        const label = submitButton.querySelector('.btn-label');
        if (label) label.textContent = loading ? 'Enviando…' : 'Enviar sugerencia';
    };

    const resetForm = () => {
        form.reset();
        fields.forEach((input) => setFieldError(input, ''));
        updateCounter();
        clearStatus();
    };

    const buildMailto = (data) => {
        const subject = encodeURIComponent('Sugerencia para Cronología de Películas');
        const body = encodeURIComponent([
            `Nombre: ${data.name}`,
            `Correo: ${data.email}`,
            '',
            data.message,
            '',
            '— Enviado desde el formulario de Cronología de Películas.'
        ].join('\n'));

        return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    };

    fields.forEach((input) => {
        input.addEventListener('blur', () => {
            if (input.value.trim() || input.type === 'checkbox') validateField(input);
        });

        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') === 'true') validateField(input);
            if (input === messageInput) updateCounter();
        });

        input.addEventListener('change', () => {
            if (input === privacyInput) validateField(input);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearStatus();

        if (!validateForm()) {
            showStatus('error', 'Revisa los campos marcados antes de enviar tu sugerencia.');
            notify('Hay campos por revisar en el formulario.', 'error');
            return;
        }

        if (honeypot?.value) {
            // Filtro antispam: no se envía nada y no se da pistas al bot.
            resetForm();
            showStatus('success', 'Gracias por tu sugerencia.');
            return;
        }

        const data = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            message: messageInput.value.trim(),
            privacy: true
        };

        setLoading(true);

        try {
            if (CONTACT_ENDPOINT) {
                const response = await fetch(CONTACT_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error(`El servicio respondió con estado ${response.status}`);
                }

                resetForm();
                showStatus('success', `¡Gracias, ${data.name}! Tu sugerencia se envió correctamente.`);
                notify('Sugerencia enviada. ¡Gracias por ayudar a ampliar la colección!', 'success');
            } else {
                const mailto = buildMailto(data);
                window.location.href = mailto;
                showStatus(
                    'success',
                    `Abrimos tu cliente de correo con la sugerencia lista para enviar. Si no se abrió, escríbenos a ${CONTACT_EMAIL}.`
                );
                notify('Revisa tu cliente de correo para completar el envío.', 'success');
            }
        } catch (error) {
            showStatus(
                'error',
                `No pudimos enviar el mensaje. Inténtalo de nuevo o escríbenos directamente a ${CONTACT_EMAIL}.`
            );
            notify('No se pudo enviar la sugerencia.', 'error');
        } finally {
            setLoading(false);
        }
    });

    updateCounter();
})();
