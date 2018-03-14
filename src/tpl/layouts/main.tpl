<!DOCTYPE html>

<html lang="en">

	<head>

		<meta charset="UTF-8">

		<title>{{ title | title }}</title>

		<!-- build:css styles/main.css -->
		<link href="styles/main.css" rel="stylesheet">
		<!-- endbuild -->

	</head>

	<body>


		{% block content %} {% endblock %}


		<!-- build:css scripts/main1.js -->
		<script src="scripts/main.js"></script>
		<!-- endbuild -->

	</body>

</html>