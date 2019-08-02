<template>
            <div>
                <v-text-field v-model="searchModel"
                              append-icon="search"
                              label="Search"
                              @keyup.enter="userlistSearch(searchModel)"
                              placeholder="Search by first name, last name or email address"
                              :append-icon-cb="() => userlistSearch(searchModel)">
                </v-text-field>

                <v-btn @click="sortByUserType">Sort by Last Name</v-btn>

                <!--<app-table :headers="headers" :posts="page.posts" class="elevation-1" :pagination.sync="pagination1"></app-table>-->
                <v-data-table :headers="headers"
                              :items="userListData"
                              :pagination.sync="pagination"
                              :rows-per-page-items="pagination.rowsPerPageItems"
                              :total-items="pagination.totalItems"
                              :loading="loading"
                              class="elevation-1">

                    <template slot="items" slot-scope="props">

                        <td class="sortColumnWidth">
                            <span><a class="hyplink" :href="editUrl + props.item.Id">{{ props.item.FirstName }}</a></span>
                        </td>
                        <td class="sortColumnWidth">
                            <span><a class="hyplink" :href="editUrl + props.item.Id">{{ props.item.LastName }}</a></span>
                        </td>
                        <td class="sortColumnWidth">{{ props.item.EmailAddress }}</td>
                        <td>{{ props.item.UserType }}</td>
                        <td v-if="props.item.Status == true">
                            <i class="material-icons" style="color:green;">
                                brightness_1
                            </i>
                            <span>
                                Active
                            </span>
                        </td>
                        <td v-else="props.item.Status == false">
                            <i class="material-icons" style="color:grey;">
                                brightness_1
                            </i>
                            <span>
                                Inactive
                            </span>
                        </td>
                        <td>{{ formatDate(props.item.LastSignin) }}</td>
                        <td class="text-xs-center">
                            <v-menu offset-x left bottom>
                                <v-btn icon slot="activator">
                                    <v-icon>more_vert</v-icon>
                                </v-btn>
                                <v-list>
                                    <v-list-tile v-for="(item, i) in actionButtons"
                                                 :key="i">
                                        <v-list-tile-title>
                                            <span v-if="item.title == 'View User'">
                                                <span>
                                                    <a class="hyplink" :href="editUrl + props.item.Id">
                                                        {{ item.title }}
                                                    </a>
                                                </span>
                                            </span>
                                            <span v-else="item.title == 'Delete User'">
                                                <span>
                                                    <a class="hyplink2" style="color:#1c82e1;"
                                                       @click="showDeleteUserDialog(props.item.Id, props.item.FirstName, props.item.LastName)">
                                                        {{ item.title }}
                                                    </a>
                                                </span>
                                            </span>
                                        </v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>
                        </td>
                    </template>
                    <template v-if="!loading" slot="no-data">
                        <v-alert :value="true" color="error" icon="warning">
                            Your search for "{{ searchInputText }}" found no results.
                        </v-alert>
                    </template>
                </v-data-table>
            </div>
</template>
<script>
    import axios from 'axios'
    import store from "@/store";

    export default {
        name: "DummyDataTable",
        props: {
            // columnnamesjson: {
            //     type: String,
            //     required: true
            // }
        },
        data: () => ({
            loading: true,
            editUrl: "/Admin/EditUser/",
            editUrlId: "",
            userIdToDelete: "",
            userFirstNameToDelete: "",
            userLastNameToDelete: "",
            onUserDeleteMessage: 'User has been successfully deleted',
            snackbar: false,
            snackbarparams: {
                y: 'top',
                timeout: 6000,
                snackbarsuccess: 'success',

            },
            params: {
                Draw: 1,
                FreeText: null,
                Length: 25,
                SortColumn: null,
                SortOrder: null,
                Start: 0
            },
            actionButtons: [
                { title: 'View User' },
                { title: 'Delete User' }
            ],
            currentpagenumber: 0,
            previouspagenumber: 0,
            dialog: false,
            search: "",
            searchInputText: "",
            headerrArrayStart: "",
            headerrArrayEnd: "",
            headerStringBuilder: "",
            headersArray: [],
            headers: [],
            ajaxData: [],
            columnNamesArrayData: [],
            tempArray: [],
            tempArrayUserListDataObject: [],
            userListDataObject: [],
            userListData: [],
            desserts: [],
            editedIndex: -1,
            pagination: {
                descending: false,
                sortBy: 'LastName',
                totalItems: 0,
                rowsPerPageItems: [25]
            },
            //userClickedonSearch: "",
        }),

        computed: {
            pagination2: {
                get: function () {
                    console.log("Get")
                },
                set: function (value) {
                    console.log("Set")
                }
            },
        },

        watch: {
            "pagination"(value) {
                //console.log("On change");
                //if (!this.userClickedonSearch)
                this.fetchData(this.pagination.page);
            },
            deep: true
        },
        created() {
            // Convert array to json
            // this.columnNamesArray = JSON.parse(this.columnnamesjson);
            this.columnNamesArray = ["First Name", "Last Name", "Email Address", "User Type", "Status", "Last Sign in", "Actions"]

            this.getColumnNames(this.columnNamesArray);
        },
        //mounted() {
        //    this.userClickedonSearch = "";
        //},
        methods: {

            userlistSearch: function (input) {
                console.log("Inside user list search");
                var self = this;
                self.loading = true;
                //this.userClickedonSearch = true;
                const pagenumber = self.pagination.page
                self.searchInputText = input;
                // Empty array and re populate data based on search criteria
                self.tempArrayUserListDataObject = [];
                self.userListData = [];
                var apiURL = '/users/GetUserListData';
                self.paginationLogic(self, pagenumber);
                if (self.pagination.sortBy === "EmailAddress") {

                    self.params.SortColumn = "Email"
                }
                if (self.pagination.descending) {
                    self.params.SortOrder = "DESC"
                }
                else {
                    self.params.SortOrder = "ASC"
                }
                //Reset start on search
                self.params.Start = 0;
                axios.post(apiURL, {
                    Draw: self.params.Draw,
                    Freetext: input,
                    Length: self.params.Length,
                    SortColumn: self.params.SortColumn,
                    SortOrder: self.params.SortOrder,
                    Start: self.params.Start
                }).then(response => {
                    self.ajaxData = response.data.data;
                    const rowLen = self.ajaxData.length;
                    self.pagination.totalItems = response.data.recordsTotal;
                    //Map data to object
                    self.ajaxData.map((item, index) => {
                        self.userListDataObject = {
                            Id: item.Id,
                            FirstName: item.FirstName,
                            LastName: item.LastName,
                            EmailAddress: item.Email,
                            UserType: item.UserType.Name,
                            Status: item.IsActive,
                            LastSignin: item.LastUpdatedDate,
                            Actions: self.actionButtons
                        }
                        // Push object
                        self.tempArrayUserListDataObject.push(self.userListDataObject)
                        // Convert object to array
                        self.userListData = Object.values(self.tempArrayUserListDataObject)
                    });
                    self.loading = false;
                    //this.userClickedonSearch = "";
                });
            },
            fetchData: function (pagenumber) {
                var self = this;
                self.loading = true;
                //this.changesortTrigger = false;
                console.log("Inside fetchdata");
                // Empty array and re populate data based on search criteria
                self.tempArrayUserListDataObject = [];
                var apiURL = '/users/GetUserListData';
                self.paginationLogic(self, pagenumber);
                if (self.pagination.sortBy === "EmailAddress") {

                    self.params.SortColumn = "Email"
                }
                else {
                    self.params.SortColumn = self.pagination.sortBy
                }

                if (self.pagination.descending) {
                    self.params.SortOrder = "DESC"
                }
                else {
                    self.params.SortOrder = "ASC"
                }
                axios.post(apiURL, {
                    Draw: self.params.Draw,
                    Freetext: self.params.Freetext,
                    Length: self.params.Length,
                    SortColumn: self.params.SortColumn,
                    SortOrder: self.params.SortOrder,
                    Start: self.params.Start
                }).then(response => {
                    self.ajaxData = response.data.data
                    const rowLen = self.ajaxData.length;
                    self.pagination.totalItems = response.data.recordsTotal;
                    //Map data to object
                    self.ajaxData.map((item, index) => {
                        self.userListDataObject = {
                            Id: item.Id,
                            FirstName: item.FirstName,
                            LastName: item.LastName,
                            EmailAddress: item.Email,
                            UserType: item.UserType.Name,
                            Status: item.IsActive,
                            LastSignin: item.LastUpdatedDate,

                        }
                        // Push object
                        self.tempArrayUserListDataObject.push(self.userListDataObject)
                    })
                    // Convert object to array
                    self.userListData = Object.values(self.tempArrayUserListDataObject)
                    });
                self.loading = false;
            },
            formatDate(unformattedDate) {
                var dateString = unformattedDate;
                dateString = new Date(dateString).toUTCString();
                dateString = dateString.split(' ').slice(0, 5).join(' ');
                return dateString;
            },
            showDeleteUserDialog(userId, firstName, lastName) {
                this.userIdToDelete = userId;
                this.userFirstNameToDelete = firstName;
                this.userLastNameToDelete = lastName;
                this.dialog = true;
            },
            deleteUser(userId) {
                this.dialog = false;
                var apiURL = '/admin/deleteuser/';

                //axios.get(apiURL, {
                //    params: {
                //        id: userId
                //    }
                //}).then(response => {
                //    self.ajaxData = response.data.data;
                //    setTimeout(function () {
                //        window.location.reload();
                //    }, 2000)
                //    this.snackbar = true;
                //});
                this.snackbar = true;
                // reset user id after deleting
                this.userIdToDelete = "";

            },
            changeSort(column) {
                console.log("Inside changesort")
                //this.changesortTrigger = true;
                if (this.pagination.sortBy === column) {
                    this.pagination.descending = !this.pagination.descending
                } else {
                    this.pagination.sortBy = column
                    this.pagination.descending = false
                }
                this.fetchData(this.pagination.page);
            },
            paginationLogic: function (self, pagenumber) {
                //Default page number
                if (pagenumber === null || pagenumber === 1) {
                    self.currentpagenumber = 1;
                    self.previouspagenumber = 1;
                    self.params.Draw = 1
                    self.params.Start = 0;
                }
                else if (pagenumber > 1) {
                    self.currentpagenumber = pagenumber
                    if (self.currentpagenumber === self.previouspagenumber || self.currentpagenumber < self.previouspagenumber) {

                        self.previouspagenumber = self.currentpagenumber + 1;
                        self.params.Draw = pagenumber
                        self.params.Start = self.params.Start - 25;
                    }
                    else {

                        self.previouspagenumber = self.currentpagenumber - 1;
                        self.params.Draw = pagenumber
                        self.params.Start = self.params.Start + 25;
                    }
                }
            },
            getColumnNames: function (headersArrayParam) {
                var self = this;
                self.headerrArrayStart = "[";
                self.headerrArrayEnd = "]";
                for (var i = 0; i < headersArrayParam.length; i++) {
                    //check for last loop and exclude "," at the end
                    // Use replace to trim whitespace since vuetify doesn't support space in table values
                    if (i == this.columnNamesArray.length - 1) {
                        if (headersArrayParam[i] == "User Type" || headersArrayParam[i] == "Status" || headersArrayParam[i] == "Last Sign in"
                            || headersArrayParam[i] == "Actions") {
                            this.headerStringBuilder = this.headerStringBuilder + "{\"text\": \""
                                + headersArrayParam[i] + "\", \"value\": \"" + headersArrayParam[i].replace(/\s/g, "")
                                + "\", \"sortable\": \"false\", \"width\":\"1%\"}"
                        }
                        else {
                            this.headerStringBuilder = this.headerStringBuilder + "{\"text\": \"" + headersArrayParam[i]
                                + "\", \"value\": \"" + headersArrayParam[i].replace(/\s/g, "") + "\", \"width\":\"1%\"}"
                        }
                    }
                    else {
                        if (headersArrayParam[i] == "User Type" || headersArrayParam[i] == "Status" || headersArrayParam[i] == "Last Sign in"
                            || headersArrayParam[i] == "Actions") {
                            this.headerStringBuilder = this.headerStringBuilder + "{\"text\": \""
                                + headersArrayParam[i] + "\", \"value\": \""
                                + headersArrayParam[i].replace(/\s/g, "") + "\", \"sortable\": \"false\", \"width\":\"1%\"}, "
                        }
                        else {
                            this.headerStringBuilder = this.headerStringBuilder + "{\"text\": \"" + headersArrayParam[i] + "\", \"value\": \""
                                + headersArrayParam[i].replace(/\s/g, "") + "\", \"width\":\"1%\"}, "
                        }
                    }
                }
                self.tempArray = this.headerrArrayStart + this.headerStringBuilder + this.headerrArrayEnd;
                self.headersArray = jQuery.parseJSON(this.tempArray);

                // Loop through each item and if sortable exists then convert value from string to boolean - else sorting
                //doesnt work
                self.headersArray.forEach(function (item) {
                    if (item.sortable !== undefined)
                        var isSortable = (item.sortable === 'true');
                    item.sortable = isSortable;
                    self.headers.push(item);
                });
                //console.log(self.headers);
                //this.headers = this.headersArray;
            },
            sortByUserType: function() {

                console.log( 'SORTTTT', this.pagination.sortBy );
                console.log( 'SORTTTT', this.pagination.sortBy );
                this.pagination.sortBy = "User Type"
                console.log( 'SORTTTT', this.pagination.sortBy );

            }
        }
    }
</script>
<style>
    .subHeader {
        margin-left: -150px;
        margin-bottom: -50px;
    }
    .sortColumnWidth{
        width:20%;
    }
    .hyplink2:hover {
        text-decoration: underline;
    }
</style>
