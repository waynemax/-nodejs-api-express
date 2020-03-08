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
                                positive: true,
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
                                positive: true,
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
                                positive: true,
                            },
                        }
                    },
                }
            },
            users: {
                versions: [1.1],
                methods: {
                    get: {
                        description: undefined,
                        have_auth: true,
                        middleware: [],
                        params: {
                            user_ids: {
                                type: 'stringArray',
                                required: true,
                                oneOf: ['query', 'user_ids'],
                            },
                            query: {
                                type: 'string',
                                required: true,
                                oneOf: ['query', 'user_ids'],
                            },
                            name_case: {
                                type: 'string',
                                required: false,
                                pickOf: ['nom', 'gen', 'dat', 'acc', 'ins', 'abl']
                            },
                            online: {
                                type: 'number',
                                required: false,
                                diapason: [0, 1]
                            },
                            fields: {
                                type: 'stringArray',
                                required: true,
                                fields: ['first_name', 'last_name', 'patronymic', 'deactivated', 'last_seen', 'verified', 'full_name', 'photo', 'gender'],
                            },
                            cursor: {
                                type: 'number',
                                required: false,
                                positive: true,
                            },
                            count: {
                                type: 'number',
                                required: false,
                                positive: true,
                                diapason: [1, 100]
                            }
                        }
                    },
                }
            },
            account: {
                versions: [1.1],
                methods: {
                    setOnline: {
                        description: undefined,
                        have_auth: true,
                        middleware: [],
                        params: {}
                    },
                    setProfileIsClosed: {
                        description: undefined,
                        have_auth: true,
                        middleware: [],
                        params: {
                            status: {
                                type: 'number',
                                required: true,
                                diapason: [0, 1]
                            },
                        }
                    },
                    changePassword: {
                        description: undefined,
                        have_auth: true,
                        middleware: [],
                        params: {
                            new_password: {
                                type: 'string',
                                required: true,
                                wcrypted: true,
                                md5: true,
                            },
                            secret_phrase: {
                                type: 'string',
                                required: true,
                                wcrypted: true,
                                md5: true,
                                minLength: 2
                            },
                        }
                    }
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
                                positive: true,
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
                            secret_phrase: {
                                type: 'string',
                                required: true,
                                wcrypted: true,
                                md5: true,
                                minLength: 2
                            },
                            gender: {
                                type: 'number',
                                required: false,
                                diapason: [0, 2],
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
                                oneOf: ['login'],
                                maxLength: 25,
                                minLength: 3
                            },
                            phone: {
                                type: 'string',
                                required: true,
                                test: /^\d+$/,
                                oneOf: ['login'],
                                minLength: 6,
                            },
                            email: {
                                type: 'string',
                                required: true,
                                test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                oneOf: ['login'] //['login', 'phone', 'email'],
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
