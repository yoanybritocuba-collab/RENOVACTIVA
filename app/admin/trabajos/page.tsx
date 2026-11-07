  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/trabajos?select=*&order=orden.asc`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store'
        })
        if (res.ok) {
          const data = await res.json()
          setProjects(data.map((t: any) => {
            const caData = t.traducciones?.ca || {}
            return {
              title: ca ? (caData.titulo || t.titulo) : t.titulo,
              type: ca ? (caData.tipo || t.tipo) : t.tipo,
              descripcion: ca ? (caData.descripcion || t.descripcion) : t.descripcion,
              categoria: t.categoria, // Categorías ya las controla el admin
              image: t.imagenes?.[0] || '',
              images: t.imagenes || [],
            }
          }))
        }
      } catch (err) {
        console.error('Error cargando proyectos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [ca]) // <-- ¡IMPORTANTE! Añadir 'ca' para que cambie al instante