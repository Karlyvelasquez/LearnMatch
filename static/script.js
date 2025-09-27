document.addEventListener("DOMContentLoaded", () => {
  // Configuration
  const BASE_URL = window.location.origin
  const FLASK_API_URL = `${BASE_URL}/api/predict`
  const FEEDBACK_API_URL = `${BASE_URL}/api/generate-feedback`
  const DEBUG_API_URL = `${BASE_URL}/api/debug`
  const TEST_API_URL = `${BASE_URL}/api/test-prediction`

  console.log("URLs configuradas:")
  console.log(`   - Base: ${BASE_URL}`)
  console.log(`   - Predicción: ${FLASK_API_URL}`)
  console.log(`   - Feedback: ${FEEDBACK_API_URL}`)
  console.log(`   - Debug: ${DEBUG_API_URL}`)
  console.log(`   - Test: ${TEST_API_URL}`)

  let currentLearningStyle = null
  let currentLearningData = null

  function initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || "light"
    const themeToggle = document.getElementById("themeToggle")
    const themeIcon = document.getElementById("themeIcon")

    // Apply saved theme
    document.documentElement.setAttribute("data-theme", savedTheme)

    // Update icon
    if (savedTheme === "dark") {
      themeIcon.className = "fas fa-sun"
    } else {
      themeIcon.className = "fas fa-moon"
    }

    // Add event listener
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme)
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    const themeIcon = document.getElementById("themeIcon")

    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)

    // Update icon with animation
    themeIcon.style.transform = "rotate(180deg)"
    setTimeout(() => {
      themeIcon.className = newTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
      themeIcon.style.transform = "rotate(0deg)"
    }, 150)
  }

  function animateNumbers() {
    const numbers = document.querySelectorAll(".animated-number")

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = Number.parseInt(entry.target.getAttribute("data-target"))
          animateNumber(entry.target, target)
          observer.unobserve(entry.target)
        }
      })
    })

    numbers.forEach((number) => observer.observe(number))
  }

  function animateNumber(element, target) {
    let current = 0
    const increment = target / 50
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      element.textContent = Math.floor(current)
    }, 30)
  }

  function initializeFAQChat() {
    const chatMessages = document.getElementById("chatMessages")
    const questionChips = document.querySelectorAll(".chip")

    const faqAnswers = {
      styles: {
        question: "¿Qué estilos de aprendizaje existen?",
        answer:
          "Existen 4 estilos principales de aprendizaje:\n\n🎨 **Visual**: Aprendes mejor con imágenes, gráficos y mapas mentales\n🎧 **Auditivo**: Prefieres escuchar explicaciones y discusiones\n✋ **Kinestésico**: Necesitas movimiento y experiencias prácticas\n📚 **Lectura/Escritura**: Te funciona mejor leer y escribir información",
      },
      accuracy: {
        question: "¿Qué tan precisa es la predicción?",
        answer:
          "Nuestro modelo de Machine Learning tiene una precisión del 95% basado en:\n\n📊 Análisis de más de 10,000 estudiantes\n🧠 Algoritmos de inteligencia artificial avanzados\n📈 Validación cruzada con múltiples métricas\n✅ Retroalimentación continua de usuarios",
      },
      change: {
        question: "¿Puede cambiar mi estilo de aprendizaje?",
        answer:
          "¡Sí! Tu estilo de aprendizaje puede evolucionar:\n\n🔄 **Adaptabilidad**: Puedes desarrollar nuevas preferencias\n📚 **Experiencia**: Diferentes materias pueden requerir diferentes enfoques\n🎯 **Práctica**: Entrenar otros estilos mejora tu flexibilidad\n⏰ **Tiempo**: Los estilos pueden cambiar con la edad y experiencia",
      },
      multiple: {
        question: "¿Puedo tener múltiples estilos?",
        answer:
          "¡Absolutamente! Es muy común tener estilos mixtos:\n\n🎭 **Multimodal**: La mayoría de personas combinan 2-3 estilos\n⚖️ **Balance**: Puedes tener un estilo dominante y otros secundarios\n🎯 **Contexto**: Diferentes situaciones pueden activar diferentes estilos\n💡 **Ventaja**: Tener múltiples estilos te hace más adaptable",
      },
    }

    questionChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const questionType = chip.getAttribute("data-question")
        const faq = faqAnswers[questionType]

        if (faq) {
          // Add user message
          addMessage(faq.question, "user")

          // Add bot response after delay
          setTimeout(() => {
            addMessage(faq.answer, "bot")
          }, 1000)
        }
      })
    })
  }

  function addMessage(text, sender) {
    const chatMessages = document.getElementById("chatMessages")
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${sender}-message`

    const now = new Date()
    const timeString = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })

    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas ${sender === "bot" ? "fa-graduation-cap" : "fa-user"}"></i>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          ${text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}
        </div>
        <div class="message-time">${timeString}</div>
      </div>
    `

    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

  function initializeMobileNav() {
    const hamburger = document.getElementById("hamburger")
    const navMenu = document.querySelector(".nav-menu")

    if (hamburger && navMenu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active")
        navMenu.classList.toggle("active")
      })

      // Close menu when clicking on links
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active")
          navMenu.classList.remove("active")
        })
      })
    }
  }

  // Learning style descriptions and recommendations
  const learningStyleData = {
    Visual: {
      description:
        "Tu estilo de aprendizaje dominante es Visual. Procesas mejor la información a través de imágenes, gráficos, mapas mentales y representaciones visuales.",
      recommendations: [
        "Usa mapas mentales y diagramas",
        "Resalta conceptos con colores",
        "Crea flashcards visuales",
        "Busca videos educativos",
        "Organiza tu espacio de estudio",
        "Utiliza tablas y gráficos",
      ],
      icon: "fas fa-eye",
      class: "visual",
    },
    Auditivo: {
      description:
        "Tu estilo de aprendizaje dominante es Auditivo. Aprendes mejor escuchando, hablando y participando en discusiones.",
      recommendations: [
        "Graba y escucha las clases",
        "Estudia en grupos de discusión",
        "Lee en voz alta",
        "Usa podcasts educativos",
        "Explica conceptos a otros",
        "Crea rimas y canciones para memorizar",
      ],
      icon: "fas fa-headphones",
      class: "auditory",
    },
    Kinestésico: {
      description:
        "Tu estilo de aprendizaje dominante es Kinestésico. Necesitas movimiento y experiencias prácticas para aprender efectivamente.",
      recommendations: [
        "Haz experimentos prácticos",
        "Toma descansos frecuentes",
        "Usa objetos manipulables",
        "Camina mientras estudias",
        "Participa en talleres hands-on",
        "Crea modelos físicos",
      ],
      icon: "fas fa-hands",
      class: "kinesthetic",
    },
    "Lectura/Escritura": {
      description:
        "Tu estilo de aprendizaje dominante es Lectura/Escritura. Prefieres aprender a través de texto escrito y expresar ideas por escrito.",
      recommendations: [
        "Toma notas detalladas",
        "Reescribe información importante",
        "Crea resúmenes y esquemas",
        "Lee fuentes adicionales",
        "Escribe ensayos y reflexiones",
        "Usa glosarios y diccionarios",
      ],
      icon: "fas fa-book-open",
      class: "reading",
    },
  }

  // Debug: Test model endpoint on startup
  async function testModelOnStartup() {
    try {
      console.log("Probando modelo...")
      const response = await fetch(TEST_API_URL)
      if (response.ok) {
        const result = await response.json()
        console.log("Resultados de prueba del modelo:", result)

        // Verificar si todas las predicciones son iguales (problema común)
        const predictions = result.test_results.map((r) => r.prediction_class)
        const uniquePredictions = [...new Set(predictions)]

        if (uniquePredictions.length === 1) {
          console.warn("PROBLEMA DETECTADO: El modelo siempre predice la misma clase:", predictions[0])
          console.warn("Esto indica que el modelo no está funcionando correctamente")
        } else {
          console.log("El modelo parece funcionar correctamente, predice diferentes clases")
        }
      }
    } catch (error) {
      console.error("Error probando modelo:", error)
    }
  }

  function setupSliderListeners() {
    const controls = [
      { id: "StudyHours", display: "StudyHoursValue", type: "slider" },
      { id: "Attendance", display: "AttendanceValue", type: "slider" },
      { id: "Resources", display: "ResourcesValue", type: "slider" },
      { id: "Extracurricular", display: "ExtracurricularValue", type: "slider" },
      { id: "Motivation", display: "MotivationValue", type: "slider" },
      { id: "Internet", display: "InternetValue", type: "select" },
      { id: "Gender", display: "GenderValue", type: "select" },
      { id: "Age", display: "AgeValue", type: "slider" },
      { id: "OnlineCourses", display: "OnlineCoursesValue", type: "slider" },
      { id: "Discussions", display: "DiscussionsValue", type: "slider" },
      { id: "AssignmentCompletion", display: "AssignmentCompletionValue", type: "slider" },
      { id: "ExamScore", display: "ExamScoreValue", type: "slider" },
      { id: "EduTech", display: "EduTechValue", type: "select" },
      { id: "StressLevel", display: "StressLevelValue", type: "slider" },
      { id: "FinalGrade", display: "FinalGradeValue", type: "slider" },
    ]

    controls.forEach(({ id, display, type }) => {
      const control = document.getElementById(id)
      const valueDisplay = document.getElementById(display)

      if (control && valueDisplay) {
        if (type === "slider") {
          control.addEventListener("input", (e) => {
            valueDisplay.textContent = e.target.value
          })
        } else if (type === "select") {
          control.addEventListener("change", (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex]
            valueDisplay.textContent = selectedOption.text
          })
          // Initialize display
          const selectedOption = control.options[control.selectedIndex]
          if (selectedOption) {
            valueDisplay.textContent = selectedOption.text
          }
        }
      } else {
        console.warn(`No se encontró control o display para ${id}/${display}`)
      }
    })

    console.log(`Configurados ${controls.length} controles`)
  }

  // Predict with ML Model
  async function predictWithMLModel(formData) {
    console.log("Enviando datos al modelo:", formData)

    const response = await fetch(FLASK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    })

    console.log(`Respuesta del servidor: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Error HTTP ${response.status}`,
      }))
      console.error("Error del servidor:", errorData)
      throw new Error(errorData.error || `Error: ${response.status}`)
    }

    const result = await response.json()
    console.log("Resultado recibido:", result)

    if (result.status === "success" && result.prediction) {
      return result
    } else {
      throw new Error(result.error || "Error en la predicción del modelo ML")
    }
  }

  // Display prediction results
  function displayResults(result) {
    const prediction = result.prediction
    const data = learningStyleData[prediction]

    if (!data) {
      console.error("No se encontraron datos para la predicción:", prediction)
      return
    }

    console.log("Mostrando resultado:", prediction)

    currentLearningStyle = prediction
    currentLearningData = result

    document.getElementById("resultLevel").textContent = prediction
    document.getElementById("resultLevel").className = `result-level ${data.class}`
    document.getElementById("resultDescription").textContent = data.description
    document.getElementById("resultIcon").innerHTML = `<i class="${data.icon}"></i>`

    // Mostrar probabilidades con más detalle
    let probabilitiesHtml = ""
    if (result.probabilities) {
      const sortedProbs = Object.entries(result.probabilities).sort(([, a], [, b]) => b - a) // Ordenar por probabilidad descendente

      probabilitiesHtml = `
        <div class="probabilities-section" style="margin: 15px 0; padding: 15px; background: rgba(0,137,123,0.05); border-radius: 12px;">
          <h5><i class="fas fa-chart-pie"></i> Distribución de Probabilidades:</h5>
          <div class="prob-bars" style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            ${sortedProbs
              .map(([style, prob]) => {
                const percentage = (prob * 100).toFixed(1)
                const isHighest = prob === Math.max(...Object.values(result.probabilities))
                return `
                <div class="prob-bar" style="display: flex; align-items: center; gap: 10px;">
                  <div style="min-width: 120px; font-weight: ${isHighest ? "600" : "400"}; color: ${isHighest ? "var(--primary-color)" : "var(--text-color)"};">
                    ${style}
                  </div>
                  <div style="flex: 1; background: #f0f0f0; border-radius: 10px; height: 20px; position: relative;">
                    <div style="width: ${percentage}%; background: ${isHighest ? "var(--primary-color)" : "#ccc"}; height: 100%; border-radius: 10px; transition: width 0.5s ease;"></div>
                  </div>
                  <div style="min-width: 50px; text-align: right; font-size: 0.9rem; font-weight: ${isHighest ? "600" : "400"};">
                    ${percentage}%
                  </div>
                </div>
              `
              })
              .join("")}
          </div>
        </div>
      `
    }

    // Mostrar información de debug si está disponible
    let debugInfo = ""
    if (result.prediction_class !== undefined) {
      debugInfo = `
        <div style="margin: 10px 0; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 8px; font-size: 0.85rem; color: #666;">
  
        </div>
      `
    }

    document.getElementById("resultRecommendations").innerHTML = `
      <h4><i class="fas fa-lightbulb"></i> Estrategias Recomendadas:</h4>
      <ul class="recommendations-list" style="list-style: none; padding: 0;">
        ${data.recommendations
          .map(
            (rec, index) => `
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <i class="fas fa-check-circle" style="color: var(--primary-color); margin-right: 8px;"></i>
            ${rec}
          </li>
        `,
          )
          .join("")}
      </ul>
      ${probabilitiesHtml}
      ${debugInfo}
    `

    document.getElementById("resultsContainer").style.display = "block"
    document.getElementById("resultsContainer").scrollIntoView({ behavior: "smooth" })
  }

  // Handle prediction submission with better error handling
  async function handlePrediction(e) {
    e.preventDefault()

    const predictBtn = document.getElementById("predictBtn")
    if (predictBtn) {
      predictBtn.disabled = true
      predictBtn.innerHTML = `
        <div class="loading-spinner" style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Analizando...</span>
      `
    }

    const formData = {
      StudyHours: Number.parseFloat(document.getElementById("StudyHours")?.value || 0),
      Attendance: Number.parseFloat(document.getElementById("Attendance")?.value || 0),
      Resources: Number.parseFloat(document.getElementById("Resources")?.value || 0),
      Extracurricular: Number.parseFloat(document.getElementById("Extracurricular")?.value || 0),
      Motivation: Number.parseFloat(document.getElementById("Motivation")?.value || 0),
      Internet: Number.parseFloat(document.getElementById("Internet")?.value || 0),
      Gender: Number.parseFloat(document.getElementById("Gender")?.value || 0),
      Age: Number.parseFloat(document.getElementById("Age")?.value || 0),
      OnlineCourses: Number.parseFloat(document.getElementById("OnlineCourses")?.value || 0),
      Discussions: Number.parseFloat(document.getElementById("Discussions")?.value || 0),
      AssignmentCompletion: Number.parseFloat(document.getElementById("AssignmentCompletion")?.value || 0),
      ExamScore: Number.parseFloat(document.getElementById("ExamScore")?.value || 0),
      EduTech: Number.parseFloat(document.getElementById("EduTech")?.value || 0),
      StressLevel: Number.parseFloat(document.getElementById("StressLevel")?.value || 0),
      FinalGrade: Number.parseFloat(document.getElementById("FinalGrade")?.value || 0),
    }

    console.log("📋 Datos del formulario recopilados:", formData)

    try {
      const result = await predictWithMLModel(formData)
      displayResults(result)

      // Mostrar mensaje de éxito
      console.log("✅ Predicción completada exitosamente")
    } catch (error) {
      console.error("❌ Error en predicción:", error)

      // Mostrar error más detallado al usuario
      const errorMessage = error.message.includes("fetch")
        ? "No se puede conectar con el servidor. Verifica que la aplicación Flask esté ejecutándose."
        : error.message

      alert(`Error en la predicción: ${errorMessage}`)
    } finally {
      // Restaurar botón
      if (predictBtn) {
        predictBtn.disabled = false
        predictBtn.innerHTML = `
          <i class="fas fa-magic"></i>
          <span>Descubrir mi Estilo de Aprendizaje</span>
        `
      }
    }
  }

  // Restart prediction (reset sliders + UI)
  function restartPrediction() {
    console.log("Reiniciando formulario...")

    const controls = [
      { id: "StudyHours", value: 2, display: "StudyHoursValue" },
      { id: "Attendance", value: 80, display: "AttendanceValue" },
      { id: "Resources", value: 5, display: "ResourcesValue" },
      { id: "Extracurricular", value: 5, display: "ExtracurricularValue" },
      { id: "Motivation", value: 5, display: "MotivationValue" },
      { id: "Internet", value: 1, display: "InternetValue" },
      { id: "Gender", value: 0, display: "GenderValue" },
      { id: "Age", value: 20, display: "AgeValue" },
      { id: "OnlineCourses", value: 2, display: "OnlineCoursesValue" },
      { id: "Discussions", value: 5, display: "DiscussionsValue" },
      { id: "AssignmentCompletion", value: 90, display: "AssignmentCompletionValue" },
      { id: "ExamScore", value: 70, display: "ExamScoreValue" },
      { id: "EduTech", value: 1, display: "EduTechValue" },
      { id: "StressLevel", value: 5, display: "StressLevelValue" },
      { id: "FinalGrade", value: 3.5, display: "FinalGradeValue" },
    ]

    controls.forEach(({ id, value, display }) => {
      const control = document.getElementById(id)
      const displayElement = document.getElementById(display)
      if (control) control.value = value
      if (displayElement) {
        if (control && control.tagName === "SELECT") {
          const selectedOption = control.options[control.selectedIndex]
          displayElement.textContent = selectedOption ? selectedOption.text : value
        } else {
          displayElement.textContent = value
        }
      }
    })

    // Limpiar variables globales
    currentLearningStyle = null
    currentLearningData = null

    // Ocultar TODOS los contenedores de resultados y feedback
    const containersToHide = ["resultsContainer", "feedbackContainer", "aiFeedbackContainer"]

    containersToHide.forEach((containerId) => {
      const container = document.getElementById(containerId)
      if (container) {
        container.style.display = "none"
      }
    })

    // Limpiar formulario de feedback
    const feedbackForm = document.getElementById("feedbackForm")
    if (feedbackForm) {
      feedbackForm.reset()
    }

    // Scroll al formulario principal
    document.getElementById("prediccion").scrollIntoView({ behavior: "smooth" })

    console.log("✅ Aplicación reiniciada completamente")
  }

  // Handle feedback form submission
  async function handleFeedbackSubmission(e) {
    e.preventDefault()

    const feedbackBtn = document.getElementById("generateFeedbackBtn")
    if (feedbackBtn) {
      feedbackBtn.disabled = true
      feedbackBtn.innerHTML = `
        <div class="loading-spinner" style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Generando estrategias...</span>
      `
    }

    // Recopilar datos del formulario de feedback
    const formData = new FormData(document.getElementById("feedbackForm"))
    const personalData = {
      age_range: formData.get("age_range"),
      career: formData.get("career"),
      academic_level: formData.get("academic_level"),
      hobbies: formData.get("hobbies"),
      living_situation: formData.get("living_situation"),
      work_status: formData.get("work_status"),
      learning_challenges: formData.get("learning_challenges"),
    }

    console.log("Datos personales recopilados:", personalData)

    try {
      const response = await fetch(FEEDBACK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          learning_style: currentLearningStyle,
          personal_data: personalData,
        }),
      })

      console.log(`Respuesta del feedback: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Error HTTP ${response.status}`,
        }))
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      const result = await response.json()
      console.log("Feedback recibido:", result)

      if (result.status === "success" && result.feedback) {
        displayAIFeedback(result.feedback)
      } else {
        throw new Error(result.error || "Error generando feedback")
      }
    } catch (error) {
      console.error("Error generando feedback:", error)

      const errorMessage = error.message.includes("fetch")
        ? "No se puede conectar con el servidor para generar feedback. Verifica tu conexión a internet y la configuración de OpenAI."
        : error.message

      alert(`Error generando estrategias: ${errorMessage}`)
    } finally {
      // Restaurar botón
      if (feedbackBtn) {
        feedbackBtn.disabled = false
        feedbackBtn.innerHTML = `
          <i class="fas fa-sparkles"></i>
          <span>Generar estrategias personalizadas</span>
        `
      }
    }
  }

  // Display AI feedback
  function displayAIFeedback(feedbackText) {
    console.log("Mostrando feedback de IA")

    // Formatear el texto del feedback
    const formattedFeedback = feedbackText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")

    document.getElementById("aiFeedbackContent").innerHTML = `
      <div class="feedback-content-formatted">
        <p>${formattedFeedback}</p>
      </div>
    `

    // Ocultar formulario de feedback y mostrar resultados de IA
    document.getElementById("feedbackContainer").style.display = "none"
    document.getElementById("aiFeedbackContainer").style.display = "block"

    // Scroll a los resultados
    document.getElementById("aiFeedbackContainer").scrollIntoView({ behavior: "smooth" })
  }

  // Show feedback form
  function showFeedbackForm() {
    console.log("Mostrando formulario de feedback")
    document.getElementById("feedbackContainer").style.display = "block"
    document.getElementById("feedbackContainer").scrollIntoView({ behavior: "smooth" })
  }

  // Event Listeners
  const learningForm = document.getElementById("learningForm")
  if (learningForm) {
    learningForm.addEventListener("submit", handlePrediction)
    console.log("Event listener de formulario configurado")
  }

  const restartBtn = document.getElementById("restartBtn")
  if (restartBtn) {
    restartBtn.addEventListener("click", restartPrediction)
    console.log("Event listener de reinicio configurado")
  }

  // Feedback button event listener
  const getFeedbackBtn = document.getElementById("getFeedbackBtn")
  if (getFeedbackBtn) {
    getFeedbackBtn.addEventListener("click", showFeedbackForm)
    console.log("Event listener de feedback configurado")
  }

  // Feedback form submission
  const feedbackForm = document.getElementById("feedbackForm")
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", handleFeedbackSubmission)
    console.log("Event listener de envío de feedback configurado")
  }

  // Additional event listeners for new analysis button
  const newAnalysisBtn = document.getElementById("newAnalysisBtn")
  if (newAnalysisBtn) {
    newAnalysisBtn.addEventListener("click", restartPrediction)
    console.log("Event listener de nuevo análisis configurado")
  }

  initializeTheme()
  initializeMobileNav()
  initializeFAQChat()
  setupSliderListeners()
  animateNumbers()
  testModelOnStartup()

  console.log("LearnMatch iniciado con todas las funcionalidades corregidas")
})
