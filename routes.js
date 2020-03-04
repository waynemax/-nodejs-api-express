module.exports = { routes: {
        allVersions: [1.1, 1.2],
        modules: {
            storage: {
                versions: [1.1],
                methods: {
                    add: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            request_key: {
                                type: 'string',
                                required: true,
                                minLength: 1,
                            },
                            response_value: {
                                type: 'string',
                                required: true,
                            },
                            client_id: {
                                type: 'number',
                                required: false,
                            },
                        }
                    },
                    get: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            request_key: {
                                type: 'stringArray',
                                required: true,
                                minLength: 1,
                            },
                            client_id: {
                                type: 'number',
                                required: false,
                            },
                        }
                    },
                    remove: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            request_key: {
                                type: 'string',
                                required: true,
                            },
                            response_value: {
                                type: 'string',
                                required: true,
                            },
                            client_id: {
                                type: 'number',
                                required: false,
                            },
                        }
                    },
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
                                oneOf: ['login', 'phone', 'email'],
                                wcrypted: true
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
                            },
                            gender: {
                                type: 'string',
                                required: true,
                                pickOf: ['man', 'female', 2]
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
                        middleware: ['storage/1.1'],
                        only: 'POST',
                        params: {}
                    },
                }
            }
        }
    } };
