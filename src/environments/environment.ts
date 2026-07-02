export interface DWTEnvironment {
  Dynamsoft: {
    resourcesPath: string;
    dwtProductKey: string;
    serviceInstallerLocation: string;
    uploadTargetURL: string;
  };
  debug: boolean;
}

export const environment: DWTEnvironment = {
  Dynamsoft: {
    resourcesPath: 'http://localhost:3000/Resources',
    dwtProductKey: 't0198EQYAAJjgsS4eBJiyZ9irJh61oJvwulamjA8wAZXPcFQ7X//g4dJoz42lB7GS/x3BpjnomgcO5FSJuFhMhLUQI35GeYj2unOygVPrO1XqO9HAyUdOkWF/deG0zT5vm8AVGHdAj+twAEiBsJYTMHXf0TtDBLAEaAHQ0hpQArK78MVnWrzt81rT/w4052QDp9Z3pgGp40QDJx85fUCsE7P43c4hIEhvTgSwBGgWwO9HdgmInAGWAM0C0ynFjABxdLB24AdaBD8k',
    serviceInstallerLocation: 'https://demo.dynamsoft.com/DWT/Resources/dist/19.4/',
    uploadTargetURL: 'https://demo.dynamsoft.com/sample-uploads/',
  },
  debug: false,
};

// dwtProductKey: 't0081jAAAAE30THReaP1rN7/7MW+82mk3aHgsDX8AK0T2Gh3wlh2VYWwDFh648OlUQ9wIAPDfc3tqS5i/DHQb8GlB9Hz8uPbMzPg58HBZuwGy6xxn',
