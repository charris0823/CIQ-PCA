// src/components/ContactTable.js

import React from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
} from "@mui/material";
import { Link } from 'react-router-dom';

function ContactTable({ rows }) {
    return (
        <TableContainer component={Paper}>
            <Table aria-label="contact table">
                <TableHead>
                    <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Job Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Agent</TableCell>
                        <TableCell>Summary</TableCell>
                        <TableCell>Cust Sent</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.key}>
                            <TableCell>
                                <Link to={`/dashboard/${row.key}`}>
                                    {row.timestamp}
                                </Link>
                            </TableCell>
                            <TableCell>{row.jobName}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>{row.agent}</TableCell>
                            <TableCell>{row.summary}</TableCell>
                            <TableCell>{row.custSent}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default ContactTable;