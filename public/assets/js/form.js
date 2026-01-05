// form.js — Enhanced form submission with better UX
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admissionForm');
  if (!form) return;

  // Add form validation styling
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
  });

  function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing validation classes
    field.classList.remove('error', 'success');
    
    if (field.required && !value) {
      field.classList.add('error');
      return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
      field.classList.add('error');
      return false;
    }
    
    if (field.type === 'number') {
      const num = Number(value);
      if (value && (num < 0 || num > 100)) {
        field.classList.add('error');
        return false;
      }
    }
    
    if (value) {
      field.classList.add('success');
    }
    
    return true;
  }

  function clearFieldError(e) {
    e.target.classList.remove('error');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    inputs.forEach(input => {
      if (!validateField({ target: input })) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      showMessage('Please correct the errors in the form before submitting.', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitLoader.classList.remove('hidden');

    const data = {
      name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      marks: Number(document.getElementById('marks').value),
      stream: document.getElementById('stream').value,
      course: document.getElementById('preferredCourse').value.trim()
    };

    try {
      const res = await fetch('/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const json = await res.json();
      
      if (json.ok) {
        // Store user email for merit rank tracking
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('applicationId', json.id);
        localStorage.setItem('applicationData', JSON.stringify(json.student));
        
        // Enhanced success message with merit list link
        const successMessage = `
          🎉 Application submitted successfully! <br>
          <strong>Your Details:</strong><br>
          • Name: ${json.student.name}<br>
          • Marks: ${json.student.marks}%<br>
          • Stream: ${json.student.stream}<br>
          • Course: ${json.student.course}<br><br>
          <strong>Application ID: ${json.id}</strong><br><br>
          <a href="merit.html" target="_blank" class="merit-link" style="
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            margin-top: 10px;
            font-weight: bold;
            transition: transform 0.3s;
          " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            🏆 Check Your Rank in Merit List
          </a>
        `;
        
        showMessage(successMessage, 'success', true);
        form.reset();
        inputs.forEach(input => input.classList.remove('success', 'error'));
        
        // Scroll to message
        document.getElementById('formMessage').scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Optional: Auto-redirect to merit list after 3 seconds
        setTimeout(() => {
          const meritLink = document.querySelector('.merit-link');
          if (meritLink && confirm('Would you like to check your rank in the merit list now?')) {
            window.open('merit.html', '_blank');
          }
        }, 3000);
      } else {
        showMessage(json.error || 'Submission failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      showMessage(
        '❌ Unable to submit application. Please check your internet connection and try again.', 
        'error'
      );
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitText.classList.remove('hidden');
      submitLoader.classList.add('hidden');
    }
  });

  function showMessage(text, type, isHTML = false) {
    const msg = document.getElementById('formMessage');
    msg.className = `message message-${type}`;
    
    if (isHTML) {
      msg.innerHTML = text;
    } else {
      msg.textContent = text;
    }
    
    msg.classList.remove('hidden');
    
    // Auto-hide success messages after 10 seconds (longer for merit list link)
    if (type === 'success') {
      setTimeout(() => {
        msg.classList.add('hidden');
      }, 10000);
    }
  }
});
