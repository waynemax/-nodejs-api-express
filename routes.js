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
                    sign_up: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            client_id: {
                                type: 'number',
                                required: true,
                            },
                            client_secret: {
                                type: 'string',
                                required: true,
                                wcrypted: true
                            },
                            first_name: {
                                type: 'string',
                                required: false,
                                test: /^[а-яеА-Яa-z 0-9]+$/iu,
                            },
                            last_name: {
                                type: 'string',
                                required: false,
                                test: /^[а-яеА-Яa-z 0-9]+$/iu,
                            },
                            login: {
                                type: 'string',
                                required: true,
                                test: /^[a-zA-Z0-9]{3,25}$/,
                                oneOf: ['login', 'phone', 'email'],
                                maxLength: 25,
                                minLength: 3
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
                            },
                            password: {
                                type: 'string',
                                required: true,
                                wcrypted: true,
                                md5: true,
                            },
                            gender: {
                                type: 'number',
                                required: false,
                                diapason: [0, 2]
                            },
                            patronymic: {
                                type: 'string',
                                required: false
                            }
                        }
                    },
                    get: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            login: {
                                type: 'string',
                                required: true,
                                test: /^[a-zA-Z0-9]{3,25}$/,
                                oneOf: ['login', 'phone', 'email'],
                                maxLength: 25,
                                minLength: 3
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
                            },
                            client_secret: {
                                type: 'string',
                                required: true,
                                wcrypted: true
                            },
                            type: {
                                type: 'string',
                                required: true,
                                pickOf: ['remote_login'],
                            },
                            password: {
                                type: 'string',
                                required: true,
                                wcrypted: true,
                                md5: true,
                            },
                        }
                    },
                    relevance: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            access_token: {
                                type: 'string',
                                required: true,
                            }
                        }
                    },
                    refresh: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            access_token: {
                                type: 'string',
                                required: true,
                            },
                            refresh_token: {
                                type: 'string',
                                required: true,
                            }
                        }
                    },
                    remove: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            access_token: {
                                type: 'string',
                                required: true,
                            }
                        }
                    },
                    removeAll: {
                        description: undefined,
                        have_auth: false,
                        middleware: [],
                        params: {
                            access_token: {
                                type: 'string',
                                required: true,
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
