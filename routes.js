module.exports = { routes: {
        allVersions: [1.1, 1.2],
        modules: {
            questions: {
                versions: [1.1],
                methods: {
                    add: {
                        description: undefined,
                        have_auth: false,
                        middleware: [
                            'auth/1.1'
                        ],
                        params: {
                            text: {
                                type: 'string',
                                required: true,
                                oneOf: ['from_id', 'else'],
                                minLength: 6,
                                maxLength: 50,
                            },
                            from_id: {
                                type: 'number',
                                required: true,
                                oneOf: ['text', 'else'],
                                diapason: [2, 80]
                            },
                            else: {
                                type: 'number',
                                required: false,
                            }
                        }
                    }
                }
            },
            auth: {
                versions: [1.1],
                methods: {
                    get: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            login: {
                                type: 'string',
                                required: true,
                                test: /^[a-zA-Z0-9]{3,15}$/,
                                oneOf: ['login', 'phone', 'email']
                            },
                            phone: {
                                type: 'string',
                                required: true,
                                test: /^\d+$/,
                                oneOf: ['login', 'phone', 'email'],
                                minLength: 6,
                            },
                            email: {
                                type: 'string',
                                required: true,
                                test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                oneOf: ['login', 'phone', 'email']
                            }
                        }
                    },
                    sign_up: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            first_name: {
                                type: 'string',
                                required: true,
                                test: /^[а-яеА-Яa-z 0-9]+$/iu,
                            }
                        }
                    },
                }
            },
            callback: {
                versions: [1.1],
                methods: {
                    aibot: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {}
                    },
                }
            }
        }
    } };
