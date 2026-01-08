// Enhanced form.js with comprehensive submission and results integration
document.addEventListener('DOMContentLoaded', () => {
  console.log('📝 Enhanced Form with complete results integration loaded');
  
  const form = document.getElementById('admissionForm');
  if (!form) {
    console.error('❌ Admission form not found');
    return;
  }

  // Add comprehensive form validation styling
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
  });

  // Enhanced field validation
  function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing validation classes
    field.classList.remove('error', 'success');
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.required && !value) {
      isValid = false;
      errorMessage = `${field.placeholder || field.name} is required`;
    }
    
    // Specific field validations
    if (value) {
      switch(field.type) {
        case 'email':
          if (!isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
          }
          break;
          
        case 'number':
          const num = Number(value);
          if (field.id === 'marks') {
            if (num < 0 || num > 100) {
              isValid = false;
              errorMessage = 'Marks must be between 0 and 100';
            } else if (num < 35) {
              // Warning for low marks but still valid
              showFieldWarning(field, 'Marks below 35% may affect admission chances');
            }
          }
          break;
          
        case 'text':
          if (field.id === 'fullName') {
            if (value.length < 2) {
              isValid = false;
              errorMessage = 'Name must be at least 2 characters long';
            } else if (!/^[a-zA-Z\s]+$/.test(value)) {
              isValid = false;
              errorMessage = 'Name should only contain letters and spaces';
            }
          }
          break;
      }
    }
    
    // Apply validation styling and feedback
    if (!isValid) {
      field.classList.add('error');
      showFieldError(field, errorMessage);
    } else if (value) {
      field.classList.add('success');
      clearFieldError(field);
    }
    
    return isValid;
  }

  function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    clearFieldError(field);
  }

  function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
    errorDiv.innerHTML = `<span>⚠️</span> ${message}`;
    field.parentNode.appendChild(errorDiv);
  }

  function showFieldWarning(field, message) {
    // Remove existing warning
    const existingWarning = field.parentNode.querySelector('.field-warning');
    if (existingWarning) {
      existingWarning.remove();
    }
    
    // Add new warning message
    const warningDiv = document.createElement('div');
    warningDiv.className = 'field-warning';
    warningDiv.style.cssText = `
      color: #f59e0b;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    `;
    warningDiv.innerHTML = `<span>💡</span> ${message}`;
    field.parentNode.appendChild(warningDiv);
  }

  function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    const existingWarning = field.parentNode.querySelector('.field-warning');
    if (existingError) existingError.remove();
    if (existingWarning) existingWarning.remove();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Enhanced form submission with comprehensive feedback
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('📤 Form submission started');
    
    // Comprehensive form validation
    let isValid = true;
    let errors = [];
    
    inputs.forEach(input => {
      if (!validateField({ target: input })) {
        isValid = false;
        errors.push(`${input.placeholder || input.name || input.id}`);
      }
    });
    
    if (!isValid) {
      const errorMessage = `Please correct the following fields: ${errors.join(', ')}`;
      showMessage(errorMessage, 'error');
      
      // Focus on first error field
      const firstErrorField = form.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    // Show loading state with enhanced UI
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitLoader.classList.remove('hidden');
    
    // Add loading overlay
    showLoadingOverlay();

    // Collect form data
    const formData = {
      name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      marks: Number(document.getElementById('marks').value),
      stream: document.getElementById('stream').value,
      course: document.getElementById('preferredCourse').value.trim()
    };

    console.log('📋 Form data prepared:', formData);

    try {
      // Enhanced endpoint detection for hosting environments
      const baseURL = window.location.origin;
      const isLocalhost = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');
      const isVercel = baseURL.includes('vercel.app') || baseURL.includes('.vercel.app');
      const isNetlify = baseURL.includes('netlify.app') || baseURL.includes('.netlify.app');
      
      console.log('🌐 Form submission environment:', {
        baseURL,
        isLocalhost,
        isVercel,
        isNetlify
      });
      
      // Smart endpoint selection for hosting
      let endpoints = [];
      
      if (isLocalhost) {
        endpoints = ['/apply', '/api/apply'];
      } else if (isVercel) {
        endpoints = [`${baseURL}/api/apply`, '/api/apply'];
      } else if (isNetlify) {
        endpoints = [`${baseURL}/.netlify/functions/api/apply`, '/api/apply'];
      } else {
        endpoints = ['/api/apply', '/apply'];
      }
      
      let response = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Attempting submission to: ${endpoint}`);
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Environment': isLocalhost ? 'local' : 'hosting'
            },
            body: JSON.stringify(formData),
            // Add timeout for hosting
            signal: AbortSignal.timeout(20000)
          });
          
          console.log(`📊 Submission response status: ${response.status}`);
          
          if (response.ok) {
            console.log(`✅ Successfully submitted to: ${endpoint}`);
            break;
          } else {
            const errorText = await response.text();
            console.log(`❌ HTTP ${response.status} for ${endpoint}: ${errorText.substring(0, 200)}`);
          }
        } catch (err) {
          console.log(`❌ Failed to submit to ${endpoint}:`, err.message);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Submission failed. Status: ${response?.status || 'Network Error'}`);
      }
      
      const result = await response.json();
      console.log('📊 Submission result:', result);
      
      if (result.ok) {
        // Store comprehensive application data
        const applicationData = {
          ...formData,
          applicationId: result.applicationId || result.id,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };
        
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('applicationId', result.applicationId || result.id);
        localStorage.setItem('applicationData', JSON.stringify(applicationData));
        localStorage.setItem('userName', formData.name);
        
        // Show comprehensive success message with complete details
        const successMessage = `
          <div style="text-align: left;">
            <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; color: #10b981;">
              🎉 Application Successfully Submitted!
            </div>
            
            <div style="background: #f0fdf4; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border-left: 4px solid #10b981;">
              <strong>📋 Your Application Details:</strong><br>
              <div style="margin: 0.5rem 0;">
                • <strong>Name:</strong> ${result.student.name}<br>
                • <strong>Email:</strong> ${result.student.email}<br>
                • <strong>Marks:</strong> ${result.student.marks}% (${getMarksGrade(result.student.marks)})<br>
                • <strong>Stream:</strong> ${result.student.stream}<br>
                • <strong>Preferred Course:</strong> ${result.student.course}<br>
                • <strong>Application ID:</strong> <code style="background: #e5e7eb; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace;">${result.applicationId || result.id}</code>
              </div>
            </div>
            
            <div style="background: #eff6ff; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border-left: 4px solid #3b82f6;">
              <strong>📈 What's Next:</strong><br>
              <div style="margin: 0.5rem 0;">
                1. Your application is now in the merit list<br>
                2. Rankings are calculated based on your marks<br>
                3. Check your rank and position among other applicants<br>
                4. Merit lists are updated in real-time
              </div>
            </div>
            
            <div style="margin-top: 1rem; text-align: center;">
              <a href="merit.html" target="_blank" class="merit-link" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                font-weight: bold;
                transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
              " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.3)'">
                🏆 View Your Rank in Merit List
              </a>
            </div>
            
            <div style="margin-top: 1rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
              💡 Tip: Bookmark the merit list page to track your ranking in real-time!
            </div>
          </div>
        `;
        
        showMessage(successMessage, 'success', true);
        
        // Reset form with enhanced feedback
        form.reset();
        inputs.forEach(input => {
          input.classList.remove('success', 'error');
          clearFieldError(input);
        });
        
        // Scroll to message smoothly
        setTimeout(() => {
          document.getElementById('formMessage').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
        
        // Enhanced auto-redirect with user choice
        setTimeout(() => {
          const meritLink = document.querySelector('.merit-link');
          if (meritLink) {
            const userWantsToSeeRank = confirm(
              `🎯 ${formData.name}, would you like to see your rank in the merit list now?\\n\\n` +
              `Your application has been successfully submitted and you can check your position among other applicants!`
            );
            
            if (userWantsToSeeRank) {
              window.open('merit.html', '_blank');
              
              // Show additional guidance
              setTimeout(() => {
                showMessage(
                  '📱 Merit list opened in new tab. You can also access it anytime from the navigation menu!', 
                  'info'
                );
              }, 1000);
            }
          }
        }, 3000);
        
        // Track successful submission
        console.log('✅ Application submitted successfully:', {
          name: formData.name,
          email: formData.email,
          marks: formData.marks,
          stream: formData.stream,
          applicationId: result.applicationId || result.id
        });
        
      } else {
        // Handle application-specific errors
        const errorMsg = result.error || 'Application submission failed';
        if (errorMsg.includes('email already exists')) {
          showMessage('⚠️ An application with this email already exists. Please check your email or contact support if you need to update your application.', 'error');
        } else {
          showMessage(`❌ ${errorMsg}`, 'error');
        }
      }
    } catch (err) {
      console.error('💥 Submission error:', err);
      
      let errorMessage = '❌ Unable to submit your application. ';
      
      if (err.message.includes('Network Error') || err.message.includes('fetch')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (err.message.includes('500')) {
        errorMessage += 'Server error occurred. Please try again in a few moments.';
      } else {
        errorMessage += 'Please try again or contact support if the problem persists.';
      }
      
      showMessage(errorMessage, 'error');
    } finally {
      // Reset button state
      hideLoadingOverlay();
      submitBtn.disabled = false;
      submitText.classList.remove('hidden');
      submitLoader.classList.add('hidden');
    }
  });

  // Helper functions
  function getMarksGrade(marks) {
    if (marks >= 95) return 'Outstanding';
    if (marks >= 85) return 'Excellent';
    if (marks >= 75) return 'Very Good';
    if (marks >= 60) return 'Good';
    if (marks >= 50) return 'Average';
    if (marks >= 35) return 'Pass';
    return 'Below Average';
  }

  function showLoadingOverlay() {
    let overlay = document.getElementById('formLoadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'formLoadingOverlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        font-size: 1.125rem;
        font-weight: 600;
      `;
      overlay.innerHTML = `
        <div style="text-align: center;">
          <div style="margin-bottom: 1rem;">
            <div style="width: 40px; height: 40px; border: 4px solid #ffffff30; border-top: 4px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
          </div>
          <div>Submitting your application...</div>
          <div style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.8;">Please wait while we process your information</div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }

  function hideLoadingOverlay() {
    const overlay = document.getElementById('formLoadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  function showMessage(text, type, isHTML = false) {
    const msg = document.getElementById('formMessage');
    if (!msg) {
      console.error('❌ Form message element not found');
      return;
    }
    
    // Enhanced message styling
    const typeStyles = {
      success: `
        background: linear-gradient(135deg, #10b981, #34d399);
        color: white;
        border: 1px solid #10b981;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      `,
      error: `
        background: linear-gradient(135deg, #ef4444, #f87171);
        color: white;
        border: 1px solid #ef4444;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
      `,
      info: `
        background: linear-gradient(135deg, #3b82f6, #60a5fa);
        color: white;
        border: 1px solid #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      `
    };
    
    msg.className = 'message';
    msg.style.cssText = `
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin: 1rem 0;
      font-size: 1rem;
      line-height: 1.5;
      ${typeStyles[type] || typeStyles.info}
      animation: slideIn 0.3s ease-out;
    `;
    
    if (isHTML) {
      msg.innerHTML = text;
    } else {
      msg.textContent = text;
    }
    
    msg.classList.remove('hidden');
    
    // Auto-hide based on type and content length
    const autoHideDelay = type === 'success' ? 15000 : (type === 'error' ? 10000 : 7000);
    setTimeout(() => {
      if (msg && !msg.classList.contains('hidden')) {
        msg.style.opacity = '0';
        setTimeout(() => {
          msg.classList.add('hidden');
          msg.style.opacity = '1';
        }, 300);
      }
    }, autoHideDelay);
  }

  // Add enhanced form styling
  const formStyle = document.createElement('style');
  formStyle.textContent = `
    .form-field {
      position: relative;
    }
    
    .form-field input,
    .form-field select {
      transition: all 0.3s ease;
    }
    
    .form-field input.error,
    .form-field select.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .form-field input.success,
    .form-field select.success {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .message {
      animation: slideIn 0.3s ease-out;
    }
  `;
  document.head.appendChild(formStyle);

  console.log('✅ Enhanced Form with Complete Results Integration loaded successfully!');
});