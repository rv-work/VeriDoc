// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DegreeRegistry {
    address public admin;

    struct Degree {
        string certificateId;
        string studentName;
        string course;
        string rollNo;
        string issueDate;
        string ipfsHash;
        address issuedBy;
        bool isValid;
    }


    struct BulkDegreeInput {
        address student;
        string certificateId;
        string studentName;
        string course;
        string rollNo;
        string issueDate;
        string ipfsHash;
    }


    mapping(address => bool) public isUniversity;

    
    mapping(address => mapping(address => mapping(string => Degree))) public degrees;

    mapping(address => string[]) public studentCertificateIds;
    mapping(address => mapping(string => address)) public certificateIssuedBy; 

    event UniversityAdded(address indexed university);
    event UniversityRemoved(address indexed university);
    event DegreeIssued(address indexed university, address indexed student, string certificateId, string ipfsHash);
    event DegreeRevoked(address indexed university, address indexed student, string certificateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyUniversity() {
        require(isUniversity[msg.sender], "Only verified universities can issue degrees");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addUniversity(address universityAddress) external onlyAdmin {
        isUniversity[universityAddress] = true;
        emit UniversityAdded(universityAddress);
    }

    function removeUniversity(address universityAddress) external onlyAdmin {
        isUniversity[universityAddress] = false;
        emit UniversityRemoved(universityAddress);
    }

    function issueDegree(
        address student,
        string memory certificateId,
        string memory studentName,
        string memory course,
        string memory rollNo,
        string memory issueDate,
        string memory ipfsHash
    ) external onlyUniversity {
        require(bytes(degrees[msg.sender][student][certificateId].certificateId).length == 0, "Certificate ID already used");

        Degree memory degree = Degree({
            certificateId: certificateId,
            studentName: studentName,
            course: course,
            rollNo: rollNo,
            issueDate: issueDate,
            ipfsHash: ipfsHash,
            issuedBy: msg.sender,
            isValid: true
        });

        degrees[msg.sender][student][certificateId] = degree;
        studentCertificateIds[student].push(certificateId);
        certificateIssuedBy[student][certificateId] = msg.sender;

        emit DegreeIssued(msg.sender, student, certificateId, ipfsHash);
    }

    function issueDegreesBulk(BulkDegreeInput[] memory inputs) external onlyUniversity {
    for (uint i = 0; i < inputs.length; i++) {
        BulkDegreeInput memory input = inputs[i];

        require(
            bytes(degrees[msg.sender][input.student][input.certificateId].certificateId).length == 0,
            string(abi.encodePacked("Duplicate certificateId: ", input.certificateId))
        );

        Degree memory degree = Degree({
            certificateId: input.certificateId,
            studentName: input.studentName,
            course: input.course,
            rollNo: input.rollNo,
            issueDate: input.issueDate,
            ipfsHash: input.ipfsHash,
            issuedBy: msg.sender,
            isValid: true
        });

        degrees[msg.sender][input.student][input.certificateId] = degree;
        studentCertificateIds[input.student].push(input.certificateId);
        certificateIssuedBy[input.student][input.certificateId] = msg.sender;

        emit DegreeIssued(msg.sender, input.student, input.certificateId, input.ipfsHash);
    }
}


    function revokeDegree(address student, string memory certificateId) external onlyUniversity {
        degrees[msg.sender][student][certificateId].isValid = false;
        emit DegreeRevoked(msg.sender, student, certificateId);
    }

    function verifyDegree(address university, address student, string memory certificateId) external view returns (
        string memory studentName,
        string memory course,
        string memory rollNo,
        string memory issueDate,
        string memory ipfsHash,
        bool isValid,
        address issuedBy
    ) {
        Degree memory d = degrees[university][student][certificateId];
        return (
            d.studentName,
            d.course,
            d.rollNo,
            d.issueDate,
            d.ipfsHash,
            d.isValid,
            d.issuedBy
        );
    }

    function getStudentCertificates(address student) external view returns (
        Degree[] memory
    ) {
        string[] memory certIds = studentCertificateIds[student];
        Degree[] memory allDegrees = new Degree[](certIds.length);

        for (uint i = 0; i < certIds.length; i++) {
            address issuer = certificateIssuedBy[student][certIds[i]];
            allDegrees[i] = degrees[issuer][student][certIds[i]];
        }

        return allDegrees;
    }
}
