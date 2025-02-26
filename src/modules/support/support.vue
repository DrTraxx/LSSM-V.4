<template>
    <lightbox name="support" no-fullscreen no-title-hide>
        <h1>{{ $t('modules.support.name') }}</h1>
        <small v-html="$t('modules.support.note')"></small>
        <form class="chat-control" v-if="$store.state.lssm_admin">
            <v-select
                v-model="selectedChat"
                :options="chatSelection"
                :reduce="chat => chat.value"
                :clearable="false"
                @input="update"
            ></v-select>
            <button class="btn btn-danger chat-archive" @click="archive">
                <i class="fas fa-file-archive"></i>
            </button>
        </form>
        <chat :messages="shownChat.messages"></chat>
        <label class="input-group">
            <input
                class="form-control input-sm"
                type="text"
                :placeholder="$t('modules.support.input')"
                v-model="message"
                minlength="1"
                maxlength="200"
                :disabled="sending"
                v-on:keydown.enter="send"
            />
            <span class="input-group-btn">
                <button
                    class="btn btn-success"
                    @click="send"
                    :disabled="!message.length || sending"
                >
                    {{ $t('modules.support.send') }}
                </button>
            </span>
        </label>
    </lightbox>
</template>

<script>
import VSelect from 'vue-select';

import Chat from './components/chat.vue';
import Lightbox from '../../components/lightbox.vue';

const config = require('../../config');

export default {
    name: 'lssmv4-support',
    components: { Chat, Lightbox, VSelect },
    data() {
        return {
            selectedChat: Object.keys(this.$store.state.support.chats)[0],
            message: '',
            sending: false,
            window,
        };
    },
    props: {
        updateFn: {
            type: Function,
            required: false,
            default: () => {},
        },
    },
    computed: {
        chats() {
            return this.$store.state.support.chats;
        },
        chatSelection() {
            return Object.keys(this.$store.state.support.chats).map(c => {
                const fm = this.$store.state.support.chats[c].messages[0];
                const author = fm && fm.author ? fm.author : { name: '' };
                return {
                    label:
                        `${author.name} ${config.games[author.game].flag}` ||
                        '',
                    value: c,
                };
            });
        },
        shownChat() {
            if (this.chats.hasOwnProperty(this.selectedChat))
                return this.chats[this.selectedChat];

            return this.chats[Object.keys(this.$store.state.support.chats)[0]];
        },
    },
    methods: {
        send() {
            this.sending = true;
            this.$store
                .dispatch('api/request', {
                    url: `${this.$store.state.server}support/support_message.php`,
                    init: {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat: this.selectedChat,
                            message: this.message,
                            username: window.username,
                            flag: config.games[
                                this.$store.state.lssm_admin
                                    ? this.selectedChat.replace(
                                          /-\d+-[\da-z]{40}$/u,
                                          ''
                                      )
                                    : window.I18n.locale
                            ].flag,
                        }),
                    },
                })
                .then(this.update)
                .then(() => {
                    this.message = '';
                    this.sending = false;
                })
                .catch(() => {});
        },
        update() {
            return this.updateFn()
                .then(() => {
                    const chat = document.querySelector('.support-chat');
                    chat.scrollTo({
                        top:
                            chat.scrollMaxY ||
                            chat.scrollHeight - chat.clientHeight,
                        left: 0,
                        behavior: 'smooth',
                    });
                })
                .then(this.markAsRead);
        },
        markAsRead() {
            this.$store
                .dispatch('api/request', {
                    url: `${this.$store.state.server}support/support_mark_as_read.php`,
                    init: {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat: this.selectedChat,
                        }),
                    },
                })
                .catch(() => {});
        },
        archive() {
            this.$store
                .dispatch('api/request', {
                    url: `${this.$store.state.server}support/archive_support_chat.php`,
                    init: {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat: this.selectedChat,
                            username:
                                this.chats[this.selectedChat].messages[0].author
                                    .name,
                            admin: window.username,
                            flag: config.games[
                                this.selectedChat.replace(
                                    /-\d+-[\da-z]{40}$/u,
                                    ''
                                )
                            ].flag,
                        }),
                    },
                })
                .then(this.update)
                .catch(() => {});
        },
    },
    mounted() {
        this.update();
    },
};
</script>

<style scoped lang="sass">
.chat-control
    display: flex

    .v-select
        width: 100%
        height: 34px

    .chat-archive
        margin-left: 1rem

input
    height: 34px
</style>
