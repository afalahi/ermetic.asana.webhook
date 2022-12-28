declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION: string;
      ASANA_WORKSPACE_ID: string;
      ASANA_PROJECT_ID: string;
      ASANA_URL: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
