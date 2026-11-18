# Referencias y fuentes

Cada referencia del proyecto en formato APA 7, con su enlace o DOI, la afirmación que respalda y dónde se usa. Aquí solo se guardan copias de documentos **públicos del Estado peruano de libre acceso** (carpeta [`oficiales/`](oficiales/)); de los artículos académicos se enlaza la fuente original, sin copiar el PDF.

## Documentos oficiales guardados en `oficiales/`

| Archivo | Qué es | Fuente oficial |
|---|---|---|
| `MEF-nota-informativa-02-2026.pdf` | Nota Informativa N.° 02 del MEF (17 de julio de 2026) sobre obras paralizadas | <https://www.mef.gob.pe/contenidos/inv_publica/docs/novedades/notas_informativas/2026/20260717.pdf> |
| `Ley-31589-El-Peruano-texto-2022-10-22.txt` | Texto original de la Ley N.° 31589, extraído de El Peruano (22/10/2022) | <https://busquedas.elperuano.pe/normaslegales/ley-que-garantiza-la-reactivacion-de-obras-publicas-paraliza-ley-n-31589-2118030-3/> |
| `MEF-metadatos-detalle-inversiones.csv` | Metadatos del conjunto de datos «Detalle de inversiones» | <https://www.datosabiertos.gob.pe/sites/default/files/Detalle_Inversiones_Metadatos.csv> |

Notas: la Ley 31589 fue modificada por los D. Leg. 1584 y 1636; el texto vigente consolidado es el TUO (D. S. N.° 206-2024-EF): <https://busquedas.elperuano.pe/dispositivo/NL/2341232-1>. El portal de datos abiertos también anuncia un diccionario de datos (`Detalle_Inversiones_Diccionario.csv`), pero su enlace respondía «404 No encontrado» el 18 de noviembre de 2026, por eso no se guarda. El texto de la Ley 31589 de esta carpeta es el original de 2022; el PDF de la Nota Informativa se guardó tal como lo publica el MEF (el contenido citado en el proyecto es el que el MEF informa en su sitio).

## Referencias (APA 7)

### 1. Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., Neelakantan, A., Shyam, P., Sastry, G., Askell, A., Agarwal, S., Herbert-Voss, A., Krueger, G., Henighan, T., Child, R., Ramesh, A., Ziegler, D. M., Wu, J., Winter, C., . . . Amodei, D. (2020). Language models are few-shot learners. En *Advances in Neural Information Processing Systems* (Vol. 33). <https://arxiv.org/abs/2005.14165>

- **Enlace / DOI:** <https://arxiv.org/abs/2005.14165>
- **Qué respalda:** Los modelos de lenguaje grandes pueden resolver tareas a partir de instrucciones y ejemplos, sin reentrenarse; sustenta el concepto de «modelo de lenguaje».
- **Dónde se usa:** Marco conceptual; glosario de `/proyecto` y `docs/EXPOSICION.md`.

### 2. Congreso de la República. (2022). *Ley N.° 31589*.

- **Enlace / DOI:** <https://busquedas.elperuano.pe/normaslegales/ley-que-garantiza-la-reactivacion-de-obras-publicas-paraliza-ley-n-31589-2118030-3/>
- **Qué respalda:** Una obra pública paralizada tiene avance físico de 40 % o más y 6 meses o más sin ejecución física, o contrato resuelto o declarado nulo (art. 2); base de la alerta de posible paralización.
- **Dónde se usa:** `/proyecto#alertas`, `/datos`, README. Copia del texto en `fuentes/oficiales/`.

### 3. Es, S., James, J., Espinosa Anke, L., & Schockaert, S. (2024). RAGAs: Automated evaluation of retrieval augmented generation. En *Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics: System Demonstrations* (pp. 150–158). <https://doi.org/10.18653/v1/2024.eacl-demo.16>

- **Enlace / DOI:** <https://doi.org/10.18653/v1/2024.eacl-demo.16>
- **Qué respalda:** Existen métricas automáticas para evaluar sistemas que responden con ayuda de documentos recuperados; respalda evaluar sin y con recuperación de datos.
- **Dónde se usa:** Método de la evaluación (`/proyecto#evaluacion`).

### 4. Gao, Y., Xiong, Y., Gao, X., Jia, K., Pan, J., Bi, Y., Dai, Y., Sun, J., Wang, M., & Wang, H. (2023). *Retrieval-augmented generation for large language models: A survey*. arXiv. <https://arxiv.org/abs/2312.10997>

- **Enlace / DOI:** <https://arxiv.org/abs/2312.10997>
- **Qué respalda:** La generación aumentada por recuperación reduce respuestas sin base al apoyarlas en fuentes externas.
- **Dónde se usa:** `/proyecto#arquitectura`.

### 5. Hou, X., Zhao, Y., Wang, S., & Wang, H. (2025). *Model Context Protocol (MCP): Landscape, security threats, and future research directions*. arXiv. <https://arxiv.org/abs/2503.23278>

- **Enlace / DOI:** <https://arxiv.org/abs/2503.23278>
- **Qué respalda:** MCP es un protocolo con un ecosistema en crecimiento y riesgos de seguridad que deben considerarse.
- **Dónde se usa:** `/proyecto#arquitectura`, preguntas de seguridad en `docs/EXPOSICION.md`.

### 6. Janssen, M., Charalabidis, Y., & Zuiderwijk, A. (2012). Benefits, adoption barriers and myths of open data and open government. *Information Systems Management, 29*(4), 258–268. <https://doi.org/10.1080/10580530.2012.716740>

- **Enlace / DOI:** <https://doi.org/10.1080/10580530.2012.716740>
- **Qué respalda:** Publicar datos abiertos no basta: hay barreras técnicas y de uso que impiden su aprovechamiento.
- **Dónde se usa:** `/proyecto#problema`.

### 7. Ji, Z., Lee, N., Frieske, R., Yu, T., Su, D., Xu, Y., Ishii, E., Bang, Y. J., Madotto, A., & Fung, P. (2023). Survey of hallucination in natural language generation. *ACM Computing Surveys, 55*(12), 1–38. <https://doi.org/10.1145/3571730>

- **Enlace / DOI:** <https://doi.org/10.1145/3571730>
- **Qué respalda:** Los modelos generativos pueden producir texto fluido pero falso («alucinación»).
- **Dónde se usa:** Glosario y evaluación (`/proyecto#evaluacion`).

### 8. Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H., Lewis, M., Yih, W.-t., Rocktäschel, T., Riedel, S., & Kiela, D. (2020). Retrieval-augmented generation for knowledge-intensive NLP tasks. En *Advances in Neural Information Processing Systems* (Vol. 33). <https://arxiv.org/abs/2005.11401>

- **Enlace / DOI:** <https://arxiv.org/abs/2005.11401>
- **Qué respalda:** Combinar un modelo de lenguaje con recuperación de información externa mejora las respuestas en tareas que exigen conocimiento.
- **Dónde se usa:** `/proyecto#arquitectura`.

### 9. Li, J., Hui, B., Qu, G., Yang, J., Li, B., Li, B., Wang, B., Qin, B., Cao, R., Geng, R., Huo, N., Zhou, X., Ma, C., Li, G., Chang, K. C. C., Huang, F., Cheng, R., & Li, Y. (2023). Can LLM already serve as a database interface? A BIg bench for large-scale database grounded text-to-SQLs. En *Advances in Neural Information Processing Systems* (Vol. 36). <https://arxiv.org/abs/2305.03111>

- **Enlace / DOI:** <https://arxiv.org/abs/2305.03111>
- **Qué respalda:** En el banco de pruebas BIRD, ChatGPT alcanzó 40,08 % de exactitud de ejecución frente a 92,96 % de personas; por eso el modelo no escribe SQL libre y usa herramientas con consultas fijas.
- **Dónde se usa:** `/proyecto#arquitectura`, `docs/EXPOSICION.md`.

### 10. Ministerio de Economía y Finanzas. (2026a). *Nota Informativa N.° 02* [Obras paralizadas, julio de 2026].

- **Enlace / DOI:** <https://www.mef.gob.pe/contenidos/inv_publica/docs/novedades/notas_informativas/2026/20260717.pdf>
- **Qué respalda:** 684 inversiones vinculadas a obras paralizadas, costo actualizado S/ 21 141 millones, devengado S/ 13 100 millones, 511 de gobiernos locales; causas: falta de recursos (109) e incumplimiento de contrato (106).
- **Dónde se usa:** `/proyecto#problema`. Copia en `fuentes/oficiales/MEF-nota-informativa-02-2026.pdf`.

### 11. Ministerio de Economía y Finanzas. (2026b). *Información de inversiones públicas 2001–2026* [Conjunto de datos]. Plataforma Nacional de Datos Abiertos. <https://www.datosabiertos.gob.pe/dataset/informaci%C3%B3n-de-inversiones-p%C3%BAblicas-2001%E2%80%932026-mef>

- **Enlace / DOI:** <https://www.datosabiertos.gob.pe/dataset/informaci%C3%B3n-de-inversiones-p%C3%BAblicas-2001%E2%80%932026-mef>
- **Qué respalda:** Fuente única de los datos: archivo `DETALLE_INVERSIONES.csv`, licencia ODC-BY.
- **Dónde se usa:** `/proyecto#datos`, `/datos`, ETL. Metadatos en `fuentes/oficiales/MEF-metadatos-detalle-inversiones.csv`.

### 12. Model Context Protocol. (2025). *Specification (versión 2025-06-18)*. <https://modelcontextprotocol.io/specification/2025-06-18>

- **Enlace / DOI:** <https://modelcontextprotocol.io/specification/2025-06-18>
- **Qué respalda:** Define el protocolo MCP (herramientas, transporte Streamable HTTP) que implementa el servidor.
- **Dónde se usa:** `/proyecto#arquitectura`, `/conectar`.

### 13. Naciones Unidas. (s. f.). *Objetivo 16: Paz, justicia e instituciones sólidas*. <https://sdgs.un.org/es/goals/goal16>

- **Enlace / DOI:** <https://sdgs.un.org/es/goals/goal16>
- **Qué respalda:** Metas 16.5, 16.6 y 16.10 sobre corrupción, instituciones transparentes y acceso a la información.
- **Dónde se usa:** `/proyecto#ods`.

### 14. Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., Cancedda, N., & Scialom, T. (2023). Toolformer: Language models can teach themselves to use tools. En *Advances in Neural Information Processing Systems* (Vol. 36). <https://arxiv.org/abs/2302.04761>

- **Enlace / DOI:** <https://arxiv.org/abs/2302.04761>
- **Qué respalda:** Los modelos de lenguaje pueden aprender a decidir cuándo y cómo usar herramientas externas.
- **Dónde se usa:** `/proyecto#arquitectura`.

### 15. Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. En *Advances in Neural Information Processing Systems* (Vol. 30). <https://arxiv.org/abs/1706.03762>

- **Enlace / DOI:** <https://arxiv.org/abs/1706.03762>
- **Qué respalda:** Arquitectura Transformer en la que se basan los modelos de lenguaje actuales.
- **Dónde se usa:** Marco conceptual (referencia de contexto).

### 16. Wang, L., Ma, C., Feng, X., Zhang, Z., Yang, H., Zhang, J., Chen, Z., Tang, J., Chen, X., Lin, Y., Zhao, W. X., Wei, Z., & Wen, J. (2024). A survey on large language model based autonomous agents. *Frontiers of Computer Science, 18*(6). <https://doi.org/10.1007/s11704-024-40231-1>

- **Enlace / DOI:** <https://doi.org/10.1007/s11704-024-40231-1>
- **Qué respalda:** Panorama de agentes autónomos basados en modelos de lenguaje; respalda el modo agente (el asistente decide qué herramienta usar).
- **Dónde se usa:** Modo agente del asistente; marco conceptual.

### 17. Wirtz, B. W., Weyerer, J. C., Becker, M., & Müller, W. M. (2022). Open government data: A systematic literature review of empirical research. *Electronic Markets, 32*(4), 2381–2404. <https://doi.org/10.1007/s12525-022-00582-8>

- **Enlace / DOI:** <https://doi.org/10.1007/s12525-022-00582-8>
- **Qué respalda:** Marco para analizar beneficios y barreras de los datos abiertos de gobierno.
- **Dónde se usa:** `/proyecto#problema`.

### 18. Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). ReAct: Synergizing reasoning and acting in language models. En *International Conference on Learning Representations (ICLR 2023)*. <https://arxiv.org/abs/2210.03629>

- **Enlace / DOI:** <https://arxiv.org/abs/2210.03629>
- **Qué respalda:** El ciclo razonar-actuar (ReAct): el modelo usa una herramienta, lee el resultado y decide si necesita otra.
- **Dónde se usa:** `/proyecto#arquitectura`.

### 19. Yu, T., Zhang, R., Yang, K., Yasunaga, M., Wang, D., Li, Z., Ma, J., Li, I., Yao, Q., Roman, S., Zhang, Z., & Radev, D. (2018). Spider: A large-scale human-labeled dataset for complex and cross-domain semantic parsing and text-to-SQL task. En *Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing* (pp. 3911–3921). <https://doi.org/10.18653/v1/D18-1425>

- **Enlace / DOI:** <https://doi.org/10.18653/v1/D18-1425>
- **Qué respalda:** Spider es un banco de pruebas de texto a SQL entre dominios; muestra la dificultad de que un modelo escriba SQL correcto.
- **Dónde se usa:** `docs/EXPOSICION.md` (por qué no se deja a la IA escribir SQL).
