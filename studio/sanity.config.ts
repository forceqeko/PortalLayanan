import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from '../sanity/schemaTypes/karantinaContent'

export default defineConfig({
  name: 'bkhit-sulut-studio',
  title: 'Admin CMS BKHIT Sulawesi Utara',
  projectId: 'vymwpeju',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
})

